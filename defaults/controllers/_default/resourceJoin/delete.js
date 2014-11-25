// --------------------
// Default resourceJoin controller
// delete action
// --------------------

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
		return this.redirect('../', 'Deleted ' + this.dataMain.name);
	},
	
	failed: resourceDeleteAction.failed,
	makeDisplayOptions: resourceDeleteAction.makeDisplayOptions
};
