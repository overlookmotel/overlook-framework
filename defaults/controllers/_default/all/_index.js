// --------------------
// Default controller
// Route definition
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var Sequelize = require('sequelize-extra');

// exports

// route definition
exports = module.exports = {
	// functions

	init: function() {
		// set title
		_.defaultValue(this, 'titleRoute', _.humanize(this.name));

		// get parent resources
		var parent = this.parent;
		if (parent) {
			if (this.parentType == 'resource') {
				this.parentResources = parent.parentResources ? _.clone(parent.parentResources) : [];
				this.parentResources.push(parent);
			} else if (parent.parentResources) {
				this.parentResources = parent.parentResources;
			}
		}
	},

	makeBreadcrumbsIndex: function(route, data, url) {
		var parent = route.parent;

		var breadcrumbs;

		if (parent) {
			var parentUrl = _.parentUrl(url);

			if (route.parentType == 'resource') {
				breadcrumbs = parent.makeBreadcrumbsItem(parent, data, parentUrl);
			} else {
				breadcrumbs = parent.makeBreadcrumbsIndex(parent, data, parentUrl);
			}
		} else {
			breadcrumbs = [];
		}

		breadcrumbs.push({title: route.titleRoute, url: url});

		return breadcrumbs;
	},

	loadWithParents: function(options) {
		// add parent options
		var modelChain;
		if (this.parentResources) {
			// get options for loading
			var topOptions = options;
			modelChain = [];
			options = {};

			var thisOptions = options;
			_.forEach(this.parentResources, function(route) {
				thisOptions.include = [{}];
				thisOptions = thisOptions.include[0];

				thisOptions.model = route.model;
				thisOptions.attributes = ['id', 'name'];
				thisOptions.where = {};
				thisOptions.where[route.paramField] = this.params[route.param];
				thisOptions.required = false;

				modelChain.push(route.model);
			}, this);

			if (topOptions) {
				topOptions.required = false;
				thisOptions.include = [topOptions];
				modelChain.push(topOptions.model);
			}

			options = options.include[0];
			delete options.required;
		}

		var model = _.pop(options, 'model');

		// load from DB
		return model.find(options).bind(this)
		.then(function(item) {
			// reverse item chain
			if (modelChain) {
				var result = Sequelize.reverseIncludes(item, modelChain); //xxx need reverseIncludes function
				if (!result) return;

				model = result.model;
				item = result.item;
			}

			// save db result to data
			if (item) this.data[model.name] = item;
		});
	}
};
