// --------------------
// Overlook
// Prototype methods
// --------------------

// modules
var _ = require('overlook-utils'),
	pathModule = require('path'),
	http = require('http'),
	Promise = require('bluebird-extra');

// libraries
var errors = require('./errors'),
	db = require('./db'),
	express = require('./express'),
	routes = require('./routes');

// exports
module.exports = {
	// initialize Overlook server
	init: function(options) {
		// parse options
		if (!options) throw new errors.OverlookError('No options provided to Overlook');
		this.options = options;
		
		// set up paths
		var paths = _.defaultValue(options, 'paths', {});
		_.defaultValue(paths, 'root', pathModule.join(__dirname, '../../'));
		
		_.defaults(paths, {
			controllers: pathModule.join(paths.root, './controllers'),
			models: pathModule.join(paths.root, './models'),
			public: pathModule.join(paths.root, './public'),
			src: pathModule.join(paths.root, './src'),
			views: pathModule.join(paths.root, './views')
		});
		
		// default options
		if (!options.database) throw new errors.OverlookError('No database details provided to Overlook');
		
		_.defaultValue(options, 'port', 3000);
		
		if (!options.domain || !options.domain.cookieSecret) throw new errors.OverlookError('No cookieSecret provided to Overlook');
		
		_.defaults(options.domain, {
			domain: 'localhost',
			sessionCookieDuration: 24 * 60 * 60 * 1000, // 24 hours
			loginCookieDuration: 14 * 24 * 60 * 60 * 1000, // 14 days
			postLoginCookieDuration: 30 * 60 * 1000, // 30 minutes
			cookieOptions: {}
		});
		
		_.defaults(options.domain.cookieOptions, {
			//domain: 'localhost',
			path: '/',
			secure: false,
			httpOnly: false
		});
		
		_.defaultValue(options, 'general', {});
		_.defaults(options.general, {
			pageLength: 20
		});
		
		console.log('Initializing Overlook app');
		
		// init sequelize and load models
		var sequelize = db.init(options.database, paths.models);
		this.sequelize = sequelize;
		this.models = sequelize.models;
		
		// init express
		this.app = express(this);
		
		// done
		console.log('Overlook app initialized');
	},
	
	// start Overlook server
	start: function() {
		console.log('Starting Overlook app');
		
		return Promise.bind(this).then(function() {
			// sync sequelize to create models in db
			console.log('Syncing database');
			
			return this.sequelize.sync({logging: logger}).bind(this)
			.then(function() {
				console.log('Database synced');

				// initialise public and root users
				console.log('Initialising system, root and public users');
				
				return db.stock(this.sequelize).bind(this)
				.spread(function(systemUser, rootUser, publicUser, rootRole, publicRole) { // jshint ignore:line
					// save to app
					this.systemUserId = systemUser.id;
					this.publicUserId = publicUser.id;
					this.rootRoleId = rootRole.id;

					console.log('Initialised system, root and public users');
				});
			});
		}).then(function() {
			// initialize routes
			return routes(this.sequelize.models, this, this.options.paths.controllers, this.options.paths.views);
		}).then(function() {
			// start server
			console.log('Server starting');
			
			var port = this.options.port;
			
			var server = http.createServer(this.app);
			this.server = server;
			
			return new Promise(function(resolve, reject) { // jshint ignore:line
				server.listen(port, function() {
					console.log('Server listening on port ' + port);
					resolve();
				});
			});
		}).then(function() {
			console.log('Server ready');
		})
		.done();
	}
};

function logger(msg) {
	//xxx use a proper logger!
	console.log(msg);
}
