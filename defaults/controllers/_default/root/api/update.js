// --------------------
// API namespace controller
// update action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var forms = require('../../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		form: true,
		api: true
	},

	// functions

	initForm: function() {
		// make form
		this.form = forms.createForm({
			fields: {
				model: {format: 'string', required: true},
				values: {format: 'json', required: true},
				where: {format: 'json', required: true}
			}
		});
	},

	process: function() {
		// convert `values` and `where` from JSON to objects
		this.actData.values = JSON.parse(this.actData.values);
		this.actData.where = JSON.parse(this.actData.where);
	},

	act: function() {
		// init actResult
		this.actResult = {};

		// record user id and date in actData
		var actData = this.actData;

		_.defaults(actData.values, {
			updatedById: this.user.id,
			updatedAt: new Date()
		});

		// get model + check exists
		var model = this.models[actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}

		// run action on DB
		return model.update(actData.values, {where: actData.where, transaction: this.transaction}).bind(this)
		.return(true)
		.catch(this.sequelize.UniqueConstraintError, function(err) { // jshint ignore:line
			// unique field not unique
			this.actResult = {error: 'uniqueFail', field: 'values'};
			return false;
		})
		.catch(this.sequelize.ForeignKeyConstraintError, function(err) { // jshint ignore:line
			// bad reference to another model
			this.actResult = {error: 'illegalValue', field: 'values'};
			return false;
		});
	}
};
