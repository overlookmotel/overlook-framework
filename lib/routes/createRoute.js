// --------------------
// Overlook
// Routing
// Function to create a route
// --------------------

// modules
var Promise = require('bluebird-extra'),
	_ = require('overlook-utils'),
	pathModule = require('path'),
	shimming = require('shimming');

// libraries
var cookies = require('../cookies'),
	transactions = require('../transactions'),
	errors = require('../errors');

// exports

module.exports = function(method, action, overlook) {
	// create route handler
	var app = overlook.app;
	app[method](action.path, function(req, res, callback) {
		return handleRoute(req, res, method, action, overlook)
		.catch(function(err) {
			// error in route handling - pass it back to express
			callback(err);
		})
		.done();
		// NB does not call callback on success - avoids request being handled by other routes
	});
	
	// set alternative handler for missing trailing slash
	if (_.endsWith(action.path, '/') && action.path != '/') {
		app[method](action.path.slice(0, -1), function(req, res, callback) { // jshint ignore:line
			res.redirect(req.url + '/');
			// NB callback not called
		});
	}
};

// functions

function handleRoute(req, res, method, action, overlook) {
	// get url + route
	var url = req.url;
	var route = action.route;
	
	// redirect if called with extra trailing slash
	if (_.endsWith(url, '/') && !_.endsWith(action.path, '/')) {
		res.redirect(req.url.slice(0, -1));
		return Promise.resolve();
	}
	
	// define 'this' for route function
	
	// base on route
	var obj = _.cloneAll(route);
	
	// add all action params
	_.extendAll(obj, action);
	
	/*
	//xxx delete this
	// add all action params (turning functions into promise-returners bound to this)
	_.forIn(action, function(param, paramName) {
		if (_.isFunction(param)) param = Promise.method(param).bind(this);
		obj[paramName] = param;
	});
	*/
	
	// add other params/methods
	_.extend(obj, {
		// params
		url: url,
		method: method,
		params: req.params,
		query: req.query,
		req: req,
		res: res,
		action: action,
		route: route,
		data: {},
		dataMain: undefined,
		
		// methods
		render: render,
		renderError: renderError,
		redirect: redirect,
		commit: transactions.commit,
		rollback: transactions.rollback,
		
		// state
		user: _.pop(req, 'user'),
		transaction: _.pop(req, 'transaction'),
		
		// app
		overlook: overlook,
		sequelize: overlook.sequelize,
		models: overlook.models
	});
	
	// for post requests, shim act function to record successful actions
	if (method == 'post') shimming.shimOne(obj, 'act', actShim);
	
	// run the route handler
	return runRoute.call(obj);
}

function runRoute() {
	// check for postLogin cookie
	var postLogin = false;
	var cookie = cookies.getCookie('postLogin', this.req, this.res, this.overlook);
	
	// check cookie valid and aimed at this page
	if (cookie && cookie.p == this.url) { //xxx check this.url is right (was just url but jshint flagged that as not defined)
		// check if cookie for this user and has body
		if (cookie.u == this.user.id && cookie.b) {
			// suitable for use
			// flag as in postLogin mode
			postLogin = true;
			
			// write form data from cookie into request
			this.req.body = cookie.b;
			this.method = 'post';
			
			// replace act function
			if (this.act) this.act = actPostLogin;
		}

		// clear cookie
		cookies.clearCookie('postLogin', this.res, this.overlook);
	}
	
	// call route controller function (get/post)
	return Promise.bind(this)
	.then(this[this.method])
	.then(function() {
		// route handling complete
		// if transaction left open, throw error
		if (this.transaction) throw new errors.OverlookError('Transaction left open');
	})
	.catch(function(err) {
		// error in handling route - rollback transaction
		return this.rollback().bind(this)
		.catch(function() {
			// rethrow original err
			//xxx flag/log somewhere that transaction remains open
			throw err;
		})
		.then(function() {
			// rethrow err
			throw err;
		});
	});
}

/*
function runRouteRemote(url, actData, userId, overlook) {
	// translate url to action and params
	//xxx write this part properly
	var route = {};
	var action = route.actions.index;
	var params = {};
	
	// make this obj
	var obj = _.clone(route);
	_.extend(obj, action);
	_.extend(obj, {
		url: url,
		method: 'post',
		params: params,
		action: action,
		route: route,
		overlook: overlook,
		sequelize: overlook.sequelize,
		models: overlook.models,
		data: {},
		dataMain: undefined,
		actData: actData
	});
	
	// start transaction
	return transactions.start.call(obj).then(function() {
		// get user details
		return authentication.getUser(userId, obj.transaction, obj.overlook);
	})
	.ifElse(function(user) {
		// got user
		obj.user = user;
		
		return Promise.method(obj.load)
		.then(obj.access)
		.ifElse(function() {
			return Promise.method(obj.loaded)
			.ifElse(function() {
				return Promise.method(obj.act);
			}, function() {
				obj.actResult = {error: 'noItem'};
				return false;
			});
		}, function() {
			obj.actResult = {error: 'accessDenied'};
			return false;
		});
	}, function() {
		obj.actResult = {error: 'authenticationError'};
		return false;
	})
	.ifElse(function() {
		// success
		return obj.commit();
	}, function() {
		// fail
		return obj.rollback();
	})
	.catch(function(err) {
		// error - rollback transaction and re-throw
		return obj.rollback().then(function() {
			throw err;
		});
	});
}
*/

// act/ shims
function actShim(act) {
	// run act
	return Promise.bind(this)
	.then(act)
	.then(function(success) {
		// record success/failure in actResult
		_.defaultValue(this, 'actResult', {});
		this.actResult.success = success;
		
		// if success, record actData to DB
		/*
		if (success && !this.actLocal) {
			//xxx write this
		}
		*/
		
		// done
		return success;
	});
}

function actPostLogin() {
	return false;
}

// rendering
function render(options, layoutOptions) {
	return renderDo.call(this, this.view, options, layoutOptions);
}

function renderError(view, options, layoutOptions) {
	return renderDo.call(this, '_compiled/_errors/' + view, options, layoutOptions);
}

function renderDo(view, options, layoutOptions) {
	return new Promise(function(resolve, reject) { // jshint ignore:line
		// render view or send json
		this.res.format({
			html: function(){
				// populate options passed to view
				options = getViewOptions(options, layoutOptions, this);
				
				// render view
				this.res.render(view, options);
				resolve();
			}.bind(this),
			
			json: function(){
				this.res.json(options);
				resolve();
			}.bind(this)
		});
	}.bind(this));
}

function redirect(url, flash, flashMode) {
	// convert url to full url
	if (!_.startsWith(url, '/') && url.search(/^[A-Za-z]+:\/\//) == -1) url = pathModule.join(this.url, url);
	
	// either redirect or send JSON message to redirect
	return new Promise(function(resolve, reject) { // jshint ignore:line
		this.res.format({
			html: function(){
				// store flash message in cookie
				if (flash) {
					var params = {p: url, m: flash};
					if (flashMode) params.s = flashMode;
				
					cookies.setCookie('flash', params, 5 * 60 * 1000, false, this.res, this.overlook); // 5 mins duration
				}
			
				// redirect
				this.res.redirect(url);
				resolve();
			}.bind(this),
		
			json: function(){
				var params = {redirect: url};
				if (flash) {
					params.flash = flash;
					if (flashMode) params.flashMode = flashMode;
				}
			
				//xxx instead of redirecting, could run the page being redirected to
				this.res.send(params);
			
				return resolve();
			}.bind(this)
		});
	}.bind(this));
}

// set options to be passed to view
function getViewOptions(options, layoutOptions, obj) {
	// init options
	if (!options) options = {};
	if (layoutOptions) _.defaults(options, layoutOptions);
	
	// check for flash message + add to options
	var cookie = cookies.getCookie('flash', obj.req, obj.res, obj.overlook);
	if (cookie && cookie.p == obj.url) {
		options.flash = {msg: cookie.m};
		if (cookie.s) options.flash.mode = cookie.s;
		
		cookies.clearCookie('flash', obj.res, obj.overlook);
	} else {
		options.flash = null;
	}
	
	return options;
}
