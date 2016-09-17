// --------------------
// Overlook
// Prototype methods
// --------------------

// modules
var _ = require('overlook-utils'),
	pathModule = require('path'),
	http = require('http'),
	whoami = require('whoami-exec'),
	Sequelize = require('sequelize-extra');

// libraries
var OverlookError = require('./errors').Error,
	Promise = require('./promise'),
	db = require('./db'),
	express = require('./express'),
	logger = require('./logger'),
	routes = require('./routes'),
	Mailer = require('./email');

// exports
module.exports = {
	// initialize Overlook server
	init: function(options) {
		// log user process is running as
		console.log('Initializing Overlook app');
		console.log('Process running as ' + whoami() + ' (' + process.getuid() + ')');
		console.log("Process running in environment '" + (process.env.NODE_ENV || 'development') + "'");

		// parse options and save to overlook instance
		if (!options) throw new OverlookError('No options provided to Overlook');
		if (!options.name) throw new OverlookError('No app name provided to Overlook');
		this.options = options;

		// set longStackTraces if in development mode
		if (options.development) {
			Promise.longStackTraces();
			Sequelize.Promise.longStackTraces();
		}

		// set up paths
		var paths = _.defaultValue(options, 'paths', {});
		_.defaultValue(paths, 'root', pathModule.join(__dirname, '../../'));

		_.defaults(paths, {
			controllers: pathModule.join(paths.root, './controllers'),
			models: pathModule.join(paths.root, './models'),
			public: pathModule.join(paths.root, './public'),
			src: pathModule.join(paths.root, './src'),
			views: pathModule.join(paths.root, './views'),
			log: pathModule.join(paths.root, './log')
		});

		// set up logging
		this.log = logger(options.name, paths.log, options.development);

		// log application starting event
		this.log('Application starting', {name: options.name, user: whoami(), userId: process.getuid(), env: process.env.NODE_ENV || 'development'});

		// default options
		if (!options.database) throw new OverlookError('No database details provided to Overlook');

		_.defaultValue(options, 'port', 3000);

		if (!options.domain || !options.domain.cookieSecret) throw new OverlookError('No cookieSecret provided to Overlook');

		_.defaults(options.domain, {
			domain: 'localhost',
			trackingCookieDuration: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
			sessionCookieDuration: 1 * 60 * 60 * 1000, // 1 hour
			loginCookieDuration: 14 * 24 * 60 * 60 * 1000, // 14 days
			postLoginCookieDuration: 30 * 60 * 1000, // 30 minutes
			cookieOptions: {}
		});

		_.defaults(options.domain.cookieOptions, {
			path: '/',
			secure: false,
			httpOnly: false
		});

		_.defaultValue(options, 'general', {});
		_.defaults(options.general, {
			pageLength: 20
		});

		// init email
		this.log('Initializing email');

		_.defaultValue(options, 'email', {});
		if (options.email.apiKey) this.mailer = new Mailer(options.email, this);

		// init sequelize and load models
		var sequelize = db.init(options.database, paths.models, this);
		this.sequelize = sequelize;
		this.models = sequelize.models;
		sequelize.overlook = this;

		// init express
		this.log('Initializing express app');
		this.app = express(this);

		// done
		this.log('Overlook app initialized');
	},

	startDB: function() {
		// sync sequelize to create models in db
		this.log('Syncing database');

		return this.sequelize.sync({logging: this.sequelize.options.logging}).bind(this)
		.then(function() {
			this.log('Database synced');

			// initialize public and root users
			this.log('Initializing system, root and public users');

			return db.stock(this.sequelize).bind(this)
			.spread(function(users, roles) {
				// save to app
				this.systemUserId = users.system.id;
				this.publicUserId = users.public.id;
				this.rootRole = roles.root;
				this.userRole = roles.user;

				this.log('Initialized system, root and public users');
			});
		}).then(function() {
			this.dbSynced = true;
			this.log('Database started');
		});
	},

	// start Overlook server
	start: function() {
		this.log('Starting Overlook app');

		return Promise.bind(this).then(function() {
			// sync db if not already done
			if (!this.dbSynced) return this.startDb();
		}).then(function() {
			// initialize routes
			return routes(this.sequelize.models, this, this.options.paths.controllers, this.options.paths.views);
		}).then(function() {
			// start server
			var port = this.options.port;

			this.log('Server starting', {port: port});

			var server = http.createServer(this.app);
			this.server = server;

			return new Promise(function(resolve, reject) { // jshint ignore:line
				server.listen(port, function() {
					this.log('Server listening', {port: port});
					resolve();
				}.bind(this));
			}.bind(this));
		}).then(function() {
			this.log('Server ready');
		})
		.catch(function(err) {
			this.log.fatal('Error during application start up', err);

			return Promise.reject(err);
		});
	}
};
