// --------------------
// Overlook
// Routing
// Function to run a route
// --------------------

// modules
// libraries
var Promise = require('../promise'),
	cookies = require('../cookies'),
	OverlookError = require('../errors').OverlookError;

// exports

module.exports = function() {
	// check for postLogin cookie
	var postLogin = false;
	var cookie = cookies.getCookie('postLogin', this.req, this.res, this.overlook);

	// check cookie valid and aimed at this page
	if (cookie && cookie.p == this.url) {
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
		if (this.transaction) throw new OverlookError('Transaction left open');
	})
	.catch(function(err) {
		// error in handling route - rollback transaction
		return this.rollback().bind(this)
		.catch(function(rollbackErr) {
			// print error
			console.log('ERROR:', rollbackErr.name + ':', rollbackErr.message);
			console.log(rollbackErr.stack);
		})
		.then(function() {
			// rethrow err
			return Promise.reject(err);
		});
	});
};

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
		return authentication.getUser(userId, obj.overlook);
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

function actPostLogin() {
	return false;
}
