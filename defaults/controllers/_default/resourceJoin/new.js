// --------------------
// Default resourceJoin controller
// new action
// --------------------

// imports
var resourceNewAction = require('../resource/new');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		singular: true,
		form: true
	},
	
	// functions
	
	initForm: resourceNewAction.initForm,
	act: resourceNewAction.act,
	actMenuOpen: resourceNewAction.actMenuOpen,
	
	done: function() {
		// load newly-created item to get names of items just joined together
		var params = {
			where: {},
			attributes: [],
			include: [{attributes: ['name']}, {attributes: ['name']}]
		};
		params.where[this.parent.model.name + 'Id'] = this.dataMain[this.parent.model.name + 'Id'];
		params.where[this.targetModel.name + 'Id'] = this.dataMain[this.targetModel.name + 'Id'];
		
		params.include[0].model = this.parent.model;
		params.include[1].model = this.targetModel;
		
		return this.model.find(params).bind(this)
		.then(function(item) {
			this.dataMain = this.data[this.model.name] = item;
			
			// redirect to index
			return this.redirect('./', 'Added ' + item[this.targetModel.name].name + ' to ' + item[this.parent.model.name].name);
		});
	},
	
	failed: function() {
		if (this.actResult.error == 'uniqueFail' && this.actResult.field == 'PRIMARY') {
			this.formErrors[this.targetModel.name + 'Id'] = 'Already in ' + this.data[this.parent.model.name].name + '. Try another.';
			return;
		}
		
		return resourceNewAction.failed();
	}
};
