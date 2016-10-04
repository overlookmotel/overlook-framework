// --------------------
// Default resource controller
// view action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var forms = require('../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		item: true
	},

	urlPart: '',
	titleAction: '',

	// functions

	init: function(defaultFn) {
		// convert `fieldsOnly` and `fieldsExclude` to arrays if values
		if (this.fieldsOnly && !_.isArray(this.fieldsOnly)) this.fieldsOnly = [this.fieldsOnly];
		if (this.fieldsExclude && !_.isArray(this.fieldsExclude)) this.fieldsExclude = [this.fieldsExclude];

		// record model fields in action
		this.fields = forms.createFieldsFromModel(this.route.model, {only: this.fieldsOnly, exclude: this.fieldsExclude});

		return defaultFn();
	},

	makeBreadcrumbs: function() {
		this.breadcrumbs = this.makeBreadcrumbsItem(this.route, this.data, this.url);
	},

	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			this.displayOptions.options.data = _.set({}, this.model.name,
				forms.getValuesByFields(
					this.dataMain,
					_.extend({createdById: {reference: 'user'}, updatedById: {reference: 'user'}, createdAt: {}, updatedAt: {}}, this.fields)
				)
			);
		});
	}
};
