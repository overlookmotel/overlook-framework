// --------------------
// Default resource controller
// new action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var Promise = require('../../../../lib/promise'),
	forms = require('../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		singular: true,
		form: true
	},

	// functions

	initForm: function() {
		// make form

		// convert `fieldsOnly` and `fieldsExclude` to arrays if values
		if (this.fieldsOnly && !_.isArray(this.fieldsOnly)) this.fieldsOnly = [this.fieldsOnly];
		if (this.fieldsExclude && !_.isArray(this.fieldsExclude)) this.fieldsExclude = [this.fieldsExclude];

		// identify fields to be excluded based on parentResources
		// NB if fieldsOnly is provided, it is not altered
		if (this.route.parentResources && !this.fieldsOnly) {
			var parentExclude = this.route.parentResources.map(function(route) {
				return route.model.name + 'Id';
			});

			if (parentExclude.length) this.fieldsExclude = _.uniq(parentExclude.concat(this.fieldsExclude || []));
		}

		// make form from model
		this.form = forms.createFormFromModel(this.route.model, {only: this.fieldsOnly, exclude: this.fieldsExclude});
		_.moveValue(this, this.form, 'loadReferences');
	},

	act: function() {
		// init actResult
		this.actResult = {};

		// record user id and date
		this.actData.createdById = this.actData.updatedById = this.user.id;
		this.actData.createdAt = this.actData.updatedAt = new Date();

		// add field from parent resource
		if (this.parentResources) {
			var parentModel = this.parentResources[this.parentResources.length - 1].model;
			this.actData[parentModel.name + 'Id'] = this.data[parentModel.name].id;
		}

		// create any sub-items
		return this.actMenuOpen().bind(this)
		.then(function() {
			// save to db
			return this.model.create(this.actData).bind(this)
			.then(function(item) {
				// success
				this.actResult.id = item.id;
				this.actData.id = item.id;
				this.dataMain = this.data[this.model.name] = item;

				return true;
			})
			.catch(this.sequelize.UniqueConstraintError, function(err) {
				// unique field not unique
				this.actResult = {error: 'uniqueFail', field: Object.keys(err.fields)[0]};
				return false;
			})
			.catch(this.sequelize.ForeignKeyConstraintError, function(err) {
				// bad reference to another model
				this.actResult = {error: 'illegalValue', field: err.index};
				return false;
			});
		});
	},

	actMenuOpen: function() {
		// if any open menus, create new items where required

		// if no open menus, exit
		if (!this.form.openMenus) return Promise.resolve();

		// create new for open menus where needed
		return Promise.each(this.form.openMenus, function(fieldName) {
			// if no name provided, exit
			// NB name is not provided into actData during form conform if ID present
			var nameFieldName = fieldName.slice(0, -2) + 'Name';
			var name = this.actData[nameFieldName];
			if (name === undefined || name === null) return;

			// need to create new item
			var newData = {
				createdById: this.user.id,
				createdAt: this.actData.updatedAt,
				updatedAt: this.actData.updatedAt
			};
			if (this.actData[fieldName]) newData.id = this.actData[fieldName];

			var modelName = this.form.fields[fieldName].modelName;
			return this.models[modelName].findOrCreate({where: {name: name}, defaults: newData}).bind(this)
			.spread(function(item, created) {
				// success
				this.actResult[fieldName] = item.id;
				this.actData[fieldName] = item.id;

				if (!created) delete this.actData[nameFieldName];
			});
		}.bind(this));
	},

	done: function() {
		// load newly-created item - needed where name is virtualField referencing other models
		return this.model.find({where: {id: this.dataMain.id}}).bind(this)
		.then(function(item) {
			this.dataMain = this.data[this.model.name] = item;

			// redirect to view item
			return this.redirect('./' + item.id + '/', 'Created ' + item.name);
		});
	},

	failed: function() {
		var error = this.actResult.error;
		var field = this.actResult.field;

		if (error == 'uniqueFail') {
			this.formErrors[field] = this.form.fields[field].label + ' is already taken. Try another.';
			return;
		} else if (error == 'illegalValue') {
			this.formErrors[field] = this.form.fields[field].label + ' is required';
			this.formData[field] = '';
			return;
		}

		throw new Error('Unknown error returned from act function');
	}
};
