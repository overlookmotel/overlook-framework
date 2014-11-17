// --------------------
// Overlook
// Express
// --------------------

// modules
var express = require('express'),
	ejsLocals = require('ejs-extended'),
	poweredBy = require('connect-powered-by'),
	less = require('less-middleware'),
	pathModule = require('path'),
	_ = require('overlook-utils');

// libraries
var transactions = require('./transactions'),
	authentication = require('./authentication'),
	cookies = require('./cookies'),
	forms = require('./forms');

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
	app.use(function(req, res, callback) {
		req.sequelize = overlook.sequelize;
		callback();
	});
	
	// middleware to start transaction on all POST requests
	app.use(function(req, res, callback) { // jshint ignore:line
		if (req.method == 'POST') {
			transactions.start.call(req).nodeify(callback);
		} else {
			callback();
		}
	});
	
	// middleware to authenticate user
	app.use(function(req, res, callback) {
		// initialise session
		authentication.processCookies(req, res, req.transaction, overlook)
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
		})
		.catch(function(err) {
			callback(err);
		});
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
	if (app.get('env') == 'development') app.use(express.errorHandler());
	
	// return app
	return app;
};
