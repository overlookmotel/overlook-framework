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
		// sort by target's name
		this.sortDefault = this.route.targetModel.name + 'Id';

		return resourceIndexAction.init.call(this, defaultFn);
	},

	start: resourceIndexAction.start,
	load: resourceIndexAction.load,
	loadOptions: resourceIndexAction.loadOptions,
	makeDisplayOptions: resourceIndexAction.makeDisplayOptions
};
