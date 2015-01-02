// --------------------
// Account namespace controller
// index action
// --------------------

// libraries
var forms = require('../../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// vars

	title: 'My Account',

	// functions

	init: function(defaultFn) {
		// record model fields in action
		this.fields = forms.createFieldsFromModel(this.route.overlook.models.user);
		delete this.fields.type;
		delete this.fields.isActive;

		return defaultFn();
	},

	load: function() {
		var options = {
			where: {id: this.user.id},
			include: [{all: 'One', attributes: ['id', 'name']}]
		};

		return this.models.user.find(options).bind(this)
		.then(function(user) {
			this.dataMain = this.data.user = user;
		});
	},

	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			this.displayOptions.options.data = {
				user: forms.getValuesByFields(this.dataMain, this.fields)
			};
		});
	}
};
