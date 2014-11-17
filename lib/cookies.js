// --------------------
// Overlook
// Cookies
// Creating, reading, clearing cookies
// --------------------

// modules
var _ = require('overlook-utils');

// exports

var cookies = module.exports = {
	// get cookie, discounting if timed out
	// clears cookie if timed out
	getCookie: function(name, req, res, overlook) {
		// get cookie
		var cookie = cookies.getCookieWithTimeout(name, req, res, overlook);
		if (!cookie || cookie.timedOut) return;
		
		// return cookie
		return cookie;
	},
	
	// get cookie, flagging if timed out
	// clears cookie if timed out
	getCookieWithTimeout: function(name, req, res, overlook) {
		// get cookie
		var cookie = req.signedCookies[name];
		if (!cookie) return;
		
		// check if timed out
		if (cookie.t < Date.now()) {
			// set as timed out
			cookie.timedOut = true;
			
			// clear cookie
			cookies.clearCookie(name, res, overlook);
		}
		delete cookie.t;
		
		// return cookie
		return cookie;
	},
	
	// sets cookie
	// flags cookie with timeout depending on duration supplied
	// expects value to be an object
	setCookie: function(name, value, duration, permanent, res, overlook) {
		var options = _.clone(overlook.options.domain.cookieOptions);
		options.signed = true;
		
		if (duration) {
			value.t = Date.now() + duration;
			if (permanent) options.maxAge = duration;
		}
		
		res.cookie(name, value, options);
	},
	
	// clears cookie
	clearCookie: function(name, res, overlook) {
		var options = _.clone(overlook.options.domain.cookieOptions);
		options.signed = true;
		
		res.clearCookie(name, options);
	}
};
