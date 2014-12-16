// --------------------
// Default resource controller
// edit action
// --------------------

// libraries
var forms = require('../../../../lib/forms');

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
		// run same initForm function as for new
		return this.route.actions.new.initForm.call(this);
	},
	
	populate: function() {
		// populate form data from db
		this.formData = forms.populateFromModelInstance(this.form, this.dataMain);
		this.formErrors = {};
	},
	
	act: function() {
		// init actResult
		this.actResult = {};
		
		// record user id and date
		this.actData.updatedById = this.user.id;
		this.actData.updatedAt = new Date();
		
		// create any sub-items
		return this.route.actions.new.actMenuOpen.call(this).bind(this)
		.then(function() {
			// update db
			return this.dataMain.updateAttributes(this.actData, {transaction: this.transaction}).bind(this)
			.return(true)
			.catch(this.sequelize.UniqueConstraintError, function(err) {
				// unique field not unique
				this.actResult = {error: 'uniqueFail', field: err.index};
				return false;
			})
			.catch(this.sequelize.ForeignKeyConstraintError, function(err) {
				// bad reference to another model
				this.actResult = {error: 'illegalValue', field: err.index};
				return false;
			});
		});
	},
	
	done: function() {
		return this.redirect('./', 'Saved changes to ' + this.dataMain.name);
	},
	
	failed: function() {
		var error = this.actResult.error,
			field = this.actResult.field,
			label = this.form.fields[field].label;
		
		if (error == 'uniqueFail') {
			this.formErrors[field] = label + ' is already taken. Try another.';
			return;
		} else if (error == 'illegalValue') {
			this.formErrors[field] = label + ' is required';
			this.formData[field] = '';
			return;
		} else if (error == 'cannotEdit') {
			this.formErrors[field] = label + ' cannot be changed';
			this.formData[field] = this.actResult.value;
			return;
		}
		
		throw new Error('Unknown error returned from act function');
	}
};
