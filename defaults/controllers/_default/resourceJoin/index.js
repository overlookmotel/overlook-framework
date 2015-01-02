// --------------------
// Default resourceJoin controller
// index action
// --------------------

// imports
var resourceIndexAction = require('../resource/index');

// exports

// action definition
exports = module.exports = {
	// functions

	init: function(defaultFn) {
		return resourceIndexAction.init.call(this, defaultFn).bind(this)
		.then(function() {
			// sort by target's name
			this.sortDefault = this.route.targetModel.name + 'Id';

			// remove fields for parent name
			delete this.fields[this.route.parent.model.name + 'Id'];
		});
	},

	start: resourceIndexAction.start,
	load: resourceIndexAction.load,
	loadOptions: resourceIndexAction.loadOptions,
	makeDisplayOptions: resourceIndexAction.makeDisplayOptions
};
