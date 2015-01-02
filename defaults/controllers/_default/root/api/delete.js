// --------------------
// API namespace controller
// delete action
// --------------------

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
				where: {format: 'json', required: true}
			}
		});
	},

	process: function() {
		// convert where from JSON to object
		this.actData.where = JSON.parse(this.actData.where);
	},

	act: function() {
		// init actResult
		this.actResult = {};

		// record user id and date in actData
		var actData = this.actData;

		// get model + check exists
		var model = this.models[actData.model];
		if (!model) {
			this.actResult = {error: 'illegalValue', field: 'model'};
			return false;
		}

		// run action on DB
		return model.destroy({where: actData.where, transaction: this.transaction}).bind(this)
		.return(true)
		.catch(this.sequelize.ForeignKeyConstraintError, function(err) { // jshint ignore:line
			// cannot be deleted
			this.actResult = {error: 'cannotDelete', field: 'where'};
			return false;
		});
	}
};
