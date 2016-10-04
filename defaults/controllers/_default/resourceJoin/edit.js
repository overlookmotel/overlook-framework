// --------------------
// Default resourceJoin controller
// edit action
// --------------------

// modules
var _ = require('overlook-utils');

// imports
var resourceEditAction = require('../resource/edit'),
	resourceNewAction = require('../resource/new');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		item: true,
		form: true
	},

	// functions

	initForm: function() {
		// remove form field for target resource
		if (this.fieldsExclude && !_.isArray(this.fieldsExclude)) this.fieldsExclude = [this.fieldsExclude];
		this.fieldsExclude = _.uniq([this.route.targetModel.name + 'Id'].concat(this.fieldsExclude || []));

		// run same function as for resource.new
		resourceNewAction.initForm.call(this);
	},

	populate: resourceEditAction.populate,
	act: resourceEditAction.act,

	done: function() {
		return this.redirect('../', 'Saved changes to ' + this.dataMain[this.targetModel.name].name);
	},

	failed: resourceEditAction.failed
};
