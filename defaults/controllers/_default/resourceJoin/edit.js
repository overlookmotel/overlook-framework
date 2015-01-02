// --------------------
// Default resourceJoin controller
// edit action
// --------------------

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
		// run same function as for resource.new
		resourceNewAction.initForm.call(this);

		// remove form fields for target resource
		delete this.form.fields[this.route.targetModel.name + 'Id'];
	},

	populate: resourceEditAction.populate,
	act: resourceEditAction.act,

	done: function() {
		return this.redirect('../', 'Saved changes to ' + this.dataMain[this.targetModel.name].name);
	},

	failed: resourceEditAction.failed
};
