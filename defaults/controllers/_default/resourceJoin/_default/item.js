// --------------------
// Default resourceJoin controller
// Default item action
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions
	
	load: function() {
		var options = {
			model: this.model,
			where: _.set({}, this.route.paramField, this.params[this.route.param]),
			include: [{all: 'One', attributes: ['id', 'name']}]
		};
		
		return this.loadWithParents(options).bind(this)
		.then(function() {
			if (this.data[this.model.name]) this.dataMain = this.data[this.model.name];
		});
	},
	loaded: function() {
		return !!this.dataMain;
	},
	loadFail: function() {
		// find item that was not found
		var type;
		if (this.parentResources) {
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
		} else {
			type = this.titleItem;
		}
		
		// render error page
		return this.renderError('noItem', {type: type}, {title: type + ' deleted', breadcrumbs: this.breadcrumbs, url: this.url, user: this.user});
	},
	
	accessFail: function(defaultFn) {
		// remove item title from breadcrumbs
		this.breadcrumbs[this.breadcrumbs.length - 1].title = this.titleItem;
		//xxx need to do this for all resource items in breadcrumbs
		
		// run default action
		return defaultFn();
	},
	
	makeTitle: function() {
		_.defaultValue(this, 'title', (this.titleAction ? this.titleAction + ' ' : '') + (this.dataMain ? this.dataMain.get('name') : this.titleItem));
	},
	makeBreadcrumbs: function() {
		this.breadcrumbs = this.makeBreadcrumbsItem(this.route, this.data, _.parentUrl(this.url));
		this.breadcrumbs.push({title: this.titleAction, url: this.url});
	}
};
