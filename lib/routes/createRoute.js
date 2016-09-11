// --------------------
// Overlook
// Routing
// Function to create a route
// --------------------

// modules
var _ = require('overlook-utils'),
	urlModule = require('url'),
	shimming = require('shimming');

// libraries
var Promise = require('../promise'),
	cookies = require('../cookies'),
	transactions = require('../transactions'),
	authentication = require('../authentication'),
	runRoute = require('./runRoute');

// exports

module.exports = function(method, action, overlook) {
	// create route handler
	var app = overlook.app;
	app[method](action.path, function(req, res, callback) {
		req.log('Handling request', {action: action.routePath});

		return handleRoute(req, res, method, action, overlook)
		.catch(function(err) {
			// error in route handling - pass error back to express
			callback(err);
		})
		.done();
		// NB does not call callback on success - avoids request being handled by other routes
	});

	// set alternative handler for missing trailing slash
	if (_.endsWith(action.path, '/') && action.path != '/') {
		app[method](action.path.slice(0, -1), function(req, res, callback) { // jshint ignore:line
			var url = req.url + '/';
			req.log('Redirect', {url: url});
			res.redirect(url);
			// NB callback not called
		});
	}
};

// functions

function handleRoute(req, res, method, action, overlook) {
	// get url + route
	var url = req.url,
		route = action.route;

	// redirect if called with extra trailing slash
	if (_.endsWith(url, '/') && !_.endsWith(action.path, '/')) {
		var redirectUrl = req.url.slice(0, -1);
		req.log('Redirect', {url: redirectUrl});
		res.redirect(redirectUrl);
		return Promise.resolve();
	}

	// define 'this' for route function

	// base on route
	var obj = _.cloneAll(route);

	// add all action params
	_.extendAll(obj, action);

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
		requestId: req.requestId,

		// methods
		render: render,
		renderError: renderError,
		redirect: redirect,
		commit: transactions.commit,
		rollback: transactions.rollback,
		log: req.log,

		// app
		overlook: overlook,
		sequelize: overlook.sequelize,
		models: overlook.models
	});

	// for post requests, shim act function to record successful actions
	if (method == 'post') shimming.shimOne(obj, 'act', actShim);

	// create CLS context
	return overlook.cls.runAndReturn(function() {
		// record request and requestId in CLS
		overlook.cls.set('request', this);
		overlook.cls.set('requestId', this.requestId);

		// start sequelize transaction
		return Promise.bind(this).then(function() {
			if (req.method == 'POST') return transactions.start.call(this);
		}).then(function() {
			// initialize session
			return authentication.processCookies(req, res, overlook);
		}).then(function(user) {
			// save user info
			this.user = user;

			// if session cookie just timed out, send to login page
			if (user.timedOutId) {
				var cookie = {u: user.timedOutId, p: req.url};
				if (req._body) cookie.b = req.body;
				cookies.setCookie('postLogin', cookie, overlook.options.domain.postLoginCookieDuration, false, res, overlook);

				// rollback transaction
				return transactions.rollback.call(this).bind(this)
				.then(function() {
					// redirect to login page
					this.log('Redirect', {url: '/login'});
					res.redirect('/login');
					// NB does not call callback()
				});
			}

			// otherwise, auhentication is complete
			// run the route handler
			this.log('Running handler', {action: action.routePath});
			return runRoute.call(this);
		}).tap(function() {
			this.log('Request complete');
			this.log.debug('HTTP Response', {res: res});
		});
    }.bind(obj));
}

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

// rendering

function render(options, layoutOptions) {
	return renderDo.call(this, this.view, options, layoutOptions);
}

function renderError(view, options, layoutOptions) {
	return renderDo.call(this, '_compiled/_errors/' + view, options, layoutOptions);
}

function renderDo(view, options, layoutOptions) {
	this.log('Render view', {view: view});

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
	this.log('Redirect', {url: url});

	// convert url to full url
	if (!_.startsWith(url, '/') && !url.match(/^[A-Za-z]+:\/\//)) url = urlModule.resolve(this.url, url);

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
