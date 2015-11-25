// --------------------
// Overlook
// Express
// --------------------

// modules
var express = require('express'),
	ejsLocals = require('ejs-extra'),
	poweredBy = require('connect-powered-by'),
	less = require('less-middleware'),
	pathModule = require('path'),
	uuid = require('uuid'),
	pmx = require('pmx'),
	_ = require('overlook-utils');

// libraries
var forms = require('./forms'),
	cookies = require('./cookies');

// exports
module.exports = function(overlook) {
	// init express
	var options = overlook.options;

	var app = express();
	app.set('port', options.port);
	app.set('views', options.paths.views);
	app.set('view engine', 'ejs');
	app.engine('ejs', ejsLocals);

	app.use(poweredBy()); // remove X-Powered-By header

	var parserOptions;
	if (options.requestSizeLimit) parserOptions = {limit: options.requestSizeLimit};

	app.use(express.json(parserOptions));
	app.use(express.urlencoded(parserOptions));
	app.use(express.cookieParser(options.domain.cookieSecret));
	//app.use(express.multipart()); // not included as no file uploads at present
	// NB express.methodOverride() not used as everything is get or post

	// less CSS compilation
	app.use(less(pathModule.join(options.paths.src, './less'), {dest: pathModule.join(options.paths.public, './css'), prefix: '/css'}));

	// static files serving
	app.use(express.static(options.paths.public));

	// create request id + log request
	app.use(function(req, res, callback) { // jshint ignore:line
		// create requestId
		var requestId = uuid.v4();
		req.requestId = requestId;

		// create request logger
		req.log = overlook.log.child({requestId: requestId});

		// get/set tracking cookie
		var cookie = cookies.getCookie(overlook.options.domain.trackingCookieName, req, res, overlook);
		var trackingId;
		if (cookie) {
			trackingId = cookie.s;
		} else {
			trackingId = uuid.v4();
			cookies.setCookie(overlook.options.domain.trackingCookieName, {s: trackingId}, overlook.options.domain.trackingCookieDuration, true, res, overlook);
		}

		// get/set browser session cookie
		cookie = cookies.getCookie(overlook.options.domain.browserSessionCookieName, req, res, overlook);
		var browserSessionId;
		if (cookie) {
			browserSessionId = cookie.s;
		} else {
			browserSessionId = uuid.v4();
			cookies.setCookie(overlook.options.domain.browserSessionCookieName, {s: browserSessionId}, null, false, res, overlook);
		}

		// log request
		var logObj = {
			method: req.method,
			url: req.url,
			trackingId: trackingId,
			browserSessionId: browserSessionId
		};
		if (req.method == 'POST') logObj.body = req.body;

		req.log('Request starting', logObj);
		req.log.debug('HTTP Request', {req: req});
		req.log.debug('Cookies', {cookies: req.signedCookies});

		callback();
	});

	// router
	app.use(app.router);

	// catch 404s (page not found)
	app.use(function(req, res, callback) { // jshint ignore:line
		// print 404 not found page
		req.log.warn('Page not found');
		res.status(404).render('_compiled/_errors/404', {title: 'Page not found', url: req.url, user: {permissions:{}}});
		req.log('Request complete');
		req.log.debug('HTTP Response', {res: res});
		// NB does not call callback()
	});

	// put _ and forms.displayers in app.locals
	app.locals._ = _;
	app.locals.displayers = forms.displayers;

	// handle errors with logging and error page
	app.use(function(err, req, res, callback) { // jshint ignore:line
		// log error
		var log = req.log || overlook.log;
		log.error('Error handling route', err);

		// notify keymetrics of error
		// convert non-errors (e.g. thrown by Sequelize) into instances of Error constructor
		var pmxErr = err;
		if (!(err instanceof Error)) {
			pmxErr = new Error('Unknown error (not Error object)');
			pmxErr.parent = err;
		}

		pmxErr.requestId = req.requestId;
		pmx.notify(pmxErr);

		// rethrow error to display error message to user
		callback(err);
	});

	if (options.development) {
		app.use(express.errorHandler());
	} else {
		app.use(function(err, req, res, callback) { // jshint ignore:line
			res.status(500);
			res.render('_compiled/_errors/unknown', {title: 'Error', url: '/', user: {permissions : {}}});
			var log = req.log || overlook.log;
			log('Request complete');
			log.debug('HTTP Response', {res: res});
		});
	}

	// return app
	return app;
};
