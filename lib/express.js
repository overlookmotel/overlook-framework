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
	marked = require('marked'),
	uuid = require('uuid'),
	fs = require('fs-extra-promise'),
	pmx = require('pmx'),
	_ = require('overlook-utils');

// libraries
var forms = require('./forms');

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

	app.use(express.json());
	app.use(express.urlencoded());
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

		// log request
		var logObj = {
			method: req.method,
			url: req.url
		};
		if (req.method == 'POST') logObj.body = req.body;

		req.log('Request starting', logObj);
		req.log.debug('Cookies', {cookies: req.signedCookies});

		callback();
	});

	// use markdown compilation
	app.get('/doc/*', function(req, res, callback) { // jshint ignore:line
		// read markdown file from /src/md
		var url = req.url.slice(5);
		if (url == '' || url.slice(-1) == '/') url += 'index';

		var path = pathModule.join(options.paths.src, './md', url + '.md');

		fs.readFileAsync(path)
		.then(function(mdTxt) {
			req.log('Serving MD file', {url: url});

			var html = marked('' + mdTxt);
			res.render('_compiled/_other/doc', {url: req.url, title: 'Documents', user: {permissions:{}}, body: html});
			req.log('Request complete');
			// NB callback not called
		})
		.catch(function(err) { // jshint ignore:line
			// file not found
			// do not handle, and pass on to next express middleware to send 404 page not found
			callback();
		});
	});

	app.get('/doc', function(req, res, callback) { // jshint ignore:line
		var url = req.url + '/';
		req.log('Redirect', {url: url});
		res.redirect(url);
		// NB callback not called
	});

	// router
	app.use(app.router);

	// catch 404s (page not found)
	app.use(function(req, res, callback) { // jshint ignore:line
		// print 404 not found page
		req.log('Page not found');
		res.status(404).render('_compiled/_errors/404', {title: 'Page not found', url: req.url, user: {permissions:{}}});
		req.log('Request complete');
		// NB does not call callback()
	});

	// put _ and forms.displayers in app.locals
	app.locals._ = _;
	app.locals.displayers = forms.displayers;

	// handle errors with logging and error page
	app.use(function(err, req, res, callback) { // jshint ignore:line
		// convert non-errors (e.g. thrown by Sequelize) into instances of Error constructor
		if (!(err instanceof Error)) {
			var newErr = new Error('Unknown error (not Error object)');
			newErr.parent = err;
			err = newErr;
		}

		// log error
		req.log.error('Error handling route', err);

		// notify keymetrics of error
		err.requestId = req.requestId;
		pmx.notify(err);

		// rethrow error to display error message to user
		callback(err);
	});

	if (options.development) {
		app.use(express.errorHandler());
	} else {
		app.use(function(err, req, res, callback) { // jshint ignore:line
			res.status(500);
			res.render('_compiled/_errors/unknown', {title: 'Error', url: '/', user: {permissions : {}}});
			req.log('Request complete');
		});
	}

	// return app
	return app;
};
