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
	cls = require('continuation-local-storage'),
	clsMiddleware = require('cls-middleware'),
	marked = require('marked'),
	fs = require('fs-extra-promise'),
	_ = require('overlook-utils');

// libraries
var transactions = require('./transactions'),
	authentication = require('./authentication'),
	cookies = require('./cookies'),
	forms = require('./forms');

// exports
module.exports = function(overlook) {
	// get CLS namespace
	var clsNamespace = cls.getNamespace('overlook');

	// init express
	var options = overlook.options;

	var app = express();
	app.set('port', options.port);
	app.set('views', options.paths.views);
	app.set('view engine', 'ejs');
	app.engine('ejs', ejsLocals);

	// create CLS context for request
	app.use(clsMiddleware(clsNamespace));

	app.use(poweredBy()); // remove X-Powered-By header
	app.use(express.logger('dev'));

	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.cookieParser(options.domain.cookieSecret));
	//app.use(express.multipart()); // not included as no file uploads at present
	// NB express.methodOverride() not used as everything is get or post

	// less CSS compilation
	app.use(less(pathModule.join(options.paths.src, './less'), {dest: pathModule.join(options.paths.public, './css'), prefix: '/css'}));

	// static files serving
	app.use(express.static(options.paths.public));

	// middleware to add sequelize to req (for transactions)
	app.use(function(req, res, callback) { // jshint ignore:line
		req.sequelize = overlook.sequelize;
		callback();
	});

	// middleware to start transaction on all POST requests
	app.use(function(req, res, callback) { // jshint ignore:line
		if (req.method == 'POST') {
			// xxx could use .nodeify(callback) here once sequelize bug
			// with nodeify losing CLS context is fixed
			transactions.start.call(req)
			.then(function(transaction) {
				callback(null, transaction);
			}, function(err) {
				callback(err);
			});
		} else {
			callback();
		}
	});

	// middleware to authenticate user
	app.use(function(req, res, callback) {
		// check for HTTP basic authentication
		authentication.processHttpAuth(req, overlook)
		.then(function(user) {
			if (user) {
				// save user info to req
				req.user = user;
				return callback();
			}

			// initialise session
			authentication.processCookies(req, res, overlook)
			.then(function(user) {
				// save user info to req
				req.user = user;

				// if session cookie just timed out, send to login page
				if (user.timedOutId) {
					var cookie = {u: user.timedOutId, p: req.url};
					if (req._body) cookie.b = req.body;
					cookies.setCookie('postLogin', cookie, options.domain.postLoginCookieDuration, false, res, overlook);

					// rollback transaction
					return transactions.rollback.call(req).then(function() {
						// redirect to login page
						res.redirect('/login');
						// NB does not call callback()
					});
				}

				callback();
			});
		})
		.catch(function(err) {
			callback(err);
		});
	});

	// use markdown compilation
	app.get('/doc/*', function(req, res, callback) { // jshint ignore:line
		// read markdown file from /src/md
		var url = req.url.slice(5);
		if (url == '' || url.slice(-1) == '/') url += 'index';

		var path = pathModule.join(options.paths.src, './md', url + '.md');

		fs.readFileAsync(path)
		.then(function(mdTxt) {
			var html = marked('' + mdTxt);
			res.render('_compiled/_other/doc', {url: req.url, title: 'Documents', user: req.user, body: html});
			// NB callback not called
		})
		.catch(function(err) { // jshint ignore:line
			// file not found
			// do not handle, and pass on to next express middleware to send 404 page not found
			callback();
		});
	});

	app.get('/doc', function(req, res, callback) { // jshint ignore:line
		res.redirect(req.url + '/');
		// NB callback not called
	});

	// router
	app.use(app.router);

	// catch 404s (page not found)
	app.use(function(req, res, callback) {
		transactions.rollback.call(req).then(function() {
			// print 404 not found page
			res.status(404).render('_compiled/_errors/404', {title: 'Page not found', url: req.url, user: req.user});
			// NB does not call callback()
		})
		.catch(function(err) {
			callback(err);
		});
	});

	// put _ and forms.displayers in app.locals
	app.locals._ = _;
	app.locals.displayers = forms.displayers;

	// development only - debugging
	//xxx provide production-ready error handler to send non-descript 500 page to browser and log
	if (options.development) {
		app.use(express.errorHandler());
	} else {
		app.use(function errorHandler(err, req, res, next) { // jshint ignore:line
			res.status(500);
			res.render('_compiled/_errors/unknown', {title: 'Error', url: '/', user: {permissions : {}}});
		});
	}

	// return app
	return app;
};
