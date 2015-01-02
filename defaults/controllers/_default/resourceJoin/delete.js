// --------------------
// Default resourceJoin controller
// delete action
// --------------------

// libraries
var forms = require('../../../../lib/forms');

// imports
var resourceDeleteAction = require('../resource/delete');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		item: true,
		form: true
	},

	// functions

	initForm: resourceDeleteAction.initForm,
	act: resourceDeleteAction.act,

	done: function() {
		return this.redirect('../', 'Deleted ' + this.dataMain[this.targetModel.name].name + ' from ' + this.dataMain[this.parent.model.name].name);
	},

	failed: function(defaultFn) {
		resourceDeleteAction.failed.call(this, defaultFn);

		this.formErrors._dummy = this.dataMain[this.targetModel.name].name + ' cannot be deleted from ' + this.dataMain[this.parent.model.name].name;
	},

	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			var data = this.displayOptions.options.data = {};
			data[this.targetModel.name] = forms.getValuesByFields(this.dataMain[this.targetModel.name], {name: {}});
			data[this.parent.model.name] = forms.getValuesByFields(this.dataMain[this.parent.model.name], {name: {}});
		});
	}
};
