// --------------------
// Default controller
// Default action
// --------------------

// modules
var Promise = require('bluebird-extra'),
	_ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions
	
	init: function() {
		// set title
		_.defaultValue(this, 'titleAction', _.humanize(this.name));
	},
	
	get: function() {
		// run chain of functions
		return Promise.bind(this)
		.then(this.start)
		.then(this.load)
		.then(this.makeTitle)
		.then(this.makeBreadcrumbs)
		.then(this.access)
		.ifElse(function() {
			return Promise.bind(this)
			.then(this.loaded)
			.ifElse(function() {
				return Promise.bind(this)
				.then(this.loadAdditional)
				.then(this.display);
			}, function() {
				return Promise.bind(this)
				.then(this.loadFail);
			});
		}, function() {
			return Promise.bind(this)
			.then(this.accessFail);
		});
		
		/*
		//xxx delete this
		this.chain([
			this.start,
			this.load,
			this.makeTitle,
			this.makeBreadcrumbs,
			{
				test: this.access,
				success: {
					test: this.loaded,
					success: [
						this.loadAdditional,
						this.display,
					],
					fail: this.loadFail
				},
				fail.accessFail
			}
		], callback);
		*/
	},
	
	start: function() {},
	
	access: function() {
		// if user not logged in, access fail
		if (!this.user.permissions.User) return false;
		
		// if user not admin and trying to access admin area, access fail
		//xxx this should be in a _default file at root of admin namespace, not here
		if (_.startsWith(this.url, '/admin/') && !this.user.permissions.Admin) return false;
		
		// access ok
		return true;
	},
	accessFail: function() {
		// if user has not permission for this action, show error
		if (this.user.id) return this.renderError('noAccess', {}, {title: 'Permission denied', breadcrumbs: this.breadcrumbs, url: this.url, user: this.user});
		
		// not logged in user - send to login page
		return this.redirect('/login');
	},
	
	// load parent resources
	load: function() {
		if (this.parentResources) return this.loadWithParents();
	},
	loaded: function() {
		if (!this.parentResources) return true;
		return !!this.data[this.parentResources[this.parentResources.length - 1].model.name];
	},
	loadFail: function() {
		// find item that was not found
		var type;
		var lastType = this.titleItem;
		_.forEachRight(this.parentResources, function(route) {
			if (this.data[route.model.name]) {
				type = lastType;
				return false;
			} else {
				lastType = route.titleItem;
			}
		}, this);
		if (!type) type = lastType;
		
		// render error page
		return this.renderError('noItem', {type: type}, {title: type + ' deleted', breadcrumbs: this.breadcrumbs, url: this.url, user: this.user});
	},
	
	makeTitle: function() {
		_.defaultValue(this, 'title', (this.titleAction ? this.titleAction + ' ' : '') + this.titleRoute);
	},
	makeBreadcrumbs: function() {
		this.breadcrumbs = this.makeBreadcrumbsIndex(this.route, this.data, _.parentUrl(this.url));
		this.breadcrumbs.push({title: this.titleAction, url: this.url});
	},
	
	loadAdditional: function() {
		// load any data needed to create menus etc
		if (!this.loadReferences) return;
		
		return Promise.each(this.loadReferences, function(model) {
			return model.findAll({attributes: ['id', 'name'], order: [['name']]}).bind(this)
			.then(function(items) {
				this.data[model.namePlural] = items;
			});
		}.bind(this));
	},
	
	display: function() {
		// get display options
		return Promise.bind(this)
		.then(this.makeDisplayOptions)
		.then(function() {
			return this.render(this.displayOptions.options, this.displayOptions.layoutOptions);
		});
	},
	
	makeDisplayOptions: function() {
		this.displayOptions = {
			options: {},
			layoutOptions: {
				title: this.title,
				breadcrumbs: this.breadcrumbs,
				url: this.url,
				user: this.user
			}
		};
	}
};
