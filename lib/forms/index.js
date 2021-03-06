// --------------------
// Overlook
// Forms
// --------------------

// modules
var _ = require('overlook-utils'),
	Sequelize = require('sequelize-extra');

// libraries
var formats = require('./formats'),
	OverlookError = require('../errors').Error;

// exports

var forms = module.exports = {
	// expose formats
	formats: formats,

	// load sanitizers, validators, conformers
	sanitizers: require('./sanitizers'),
	validators: require('./validators'),
	conformers: require('./conformers'),
	populators: require('./populators'),
	displayers: require('./displayers'),

	// functions

	// create form from basic details
	createForm: function(form) {
		var fields = form.fields;

		_.forIn(fields, function(field, fieldName) {
			forms.createField(fieldName, field);
		});

		return form;
	},
	createField: function(fieldName, field) {
		forms.formatInherit(field);
		_.defaultValue(field, 'label', _.humanize(fieldName));

		return field;
	},
	addField: function(form, fieldName, field) {
		form.fields[fieldName] = forms.createField(fieldName, field);
	},

	// create form from model
	createFormFromModel: function(model, options) {
		// conform options
		if (!options) options = {};
		if (options.exclude && !_.isArray(options.exclude)) options.exclude = [options.exclude];
		if (options.only && !_.isArray(options.only)) options.only = [options.only];

		// loop through model fields, creating form fields
		var form = {fields: {}},
			fields = form.fields,
			loadReferences = [],
			openMenus = [],
			models = model.sequelize.models;

		_.forIn(model.rawAttributes, function(fieldParams, fieldName) {
			// skip fields based on options and whether virtual field or secret
			if (options.only) {
				if (options.only.indexOf(fieldName) == -1) return;
			} else if (!options.all) {
				if (['id', 'createdById', 'updatedById', 'createdAt', 'updatedAt'].indexOf(fieldName) != -1) return;
				if (fieldParams.secret) return;
				if (fieldParams.type instanceof Sequelize.VIRTUAL) return;
			}
			if (options.exclude && options.exclude.indexOf(fieldName) != -1) return;

			// find out field format
			var field = forms.getFormatFromModelField(fieldParams);

			// set required
			if (fieldParams.allowNull === false) field.required = true;

			// set reference
			if (fieldParams.reference) {
				if (!fieldParams.format) field.widget = 'menu'; // NB if format defined, that should also define widget

				if (field.widget == 'menu') {
					var refModel = models[fieldParams.reference];
					field.dataName = refModel.namePlural;
					_.pushNoDup(loadReferences, refModel);
				} else if (field.widget == 'menuOpen') {
					field.modelName = fieldParams.reference;
					field.additionalFields = ['name'];
					openMenus.push(fieldName);
				}
			}

			// set maxlen validator if length
			if (field.length && !field.validate.maxLen) field.validate.maxLen = field.length;

			fields[fieldName] = field;
		});

		// add references and openMenus to form
		if (loadReferences.length) form.loadReferences = loadReferences;
		if (openMenus.length) form.openMenus = openMenus;

		// done
		return form;
	},

	// create display fields from model
	createFieldsFromModel: function(model, options) {
		if (!options) options = {};
		if (options.exclude && !_.isArray(options.exclude)) options.exclude = [options.exclude];
		if (options.only && !_.isArray(options.only)) options.only = [options.only];

		var models = model.sequelize.models,
			fields = {};

		_.forIn(model.rawAttributes, function(fieldParams, fieldName) {
			if (options.only) {
				if (options.only.indexOf(fieldName) == -1) return;
			} else if (!options.all) {
				if (['id', 'createdById', 'updatedById', 'createdAt', 'updatedAt'].indexOf(fieldName) != -1) return;
				if (fieldParams.secret) return;
				if (fieldName == 'name' && fieldParams.type instanceof Sequelize.VIRTUAL) return;
			}
			if (options.exclude && options.exclude.indexOf(fieldName) != -1) return;

			// find out field format
			var field = forms.getFormatFromModelField(fieldParams);

			// remove uneccesary information
			field = _.omit(field, ['validate', 'conform', 'populate', 'length', 'widget', 'requiredOverride']);
			field.widget = _.pop(field, 'filterWidget');

			// set reference
			if (fieldParams.reference) {
				if (!fieldParams.format) field.widget = 'menu'; // NB if format defined, that should also define widget

				if (field.widget == 'menu') {
					var refModel = models[fieldParams.reference];
					field.dataName = refModel.namePlural;
					field.required = false;
					//_.pushNoDup(loadReferences, refModel);
				} else if (field.widget == 'menuOpen') {
					field.modelName = fieldParams.reference;
					field.additionalFields = ['name'];
					//openMenus.push(fieldName);
				}

				field.reference = fieldParams.reference;
			}

			fields[fieldName] = field;
		});

		return fields;
	},

	// get data values from data according to fields
	getValuesByFields: function(data, fields) {
		// if array, run function on each item in array
		if (_.isArray(data)) {
			return data.map(function(item) {
				return forms.getValuesByFields(item, fields);
			});
		}

		// filter data to only pass fields listed in fields
		data = data.getValues();

		var dataOut = {};
		_.forIn(fields, function(field, fieldName) {
			if (field.reference) {
				var refName = fieldName.slice(0, -2);
				if (data[refName]) {
					dataOut[refName] = {};
					_.copyValue(dataOut[refName], data[refName], 'id');
					_.copyValue(dataOut[refName], data[refName], 'name');
				} else {
					dataOut[refName] = data[fieldName];
				}
			} else {
				dataOut[fieldName] = data[fieldName];
			}
		});
		return dataOut;
	},

	// work out format from model field
	getFormatFromModelField: function(fieldParams) {
		var field,
			type = fieldParams.type;

		if (type instanceof Sequelize.BOOLEAN) {
			field = {format: 'boolean', default: fieldParams.defaultValue ? '1' : '0'};
		} else if (type instanceof Sequelize.DATEONLY) {
			field = {format: 'date'};
		} else if (type == 'TIME') {
			field = {format: 'time'};
		} else if (type instanceof Sequelize.DATETIME) {
			field = {format: 'dateTime'};
		} else if (type instanceof Sequelize.INTEGER || type instanceof Sequelize.BIGINT) {
			if (type._unsigned) {
				field = {format: 'intPos'};
			} else {
				field = {format: 'int'};
			}
		} else if (type instanceof Sequelize.DECIMAL) {
			field = {
				format: 'decimal',
				validate: {decimal: {scale: type._scale}},
				conform: {decimal: {scale: type._scale}},
				populate: {decimal: {scale: type._scale}},
				display: {decimal: {scale: type._scale}}
			};
		} else if (type instanceof Sequelize.TEXT) {
			field = {
				format: 'text',
				length: {tiny: 255, text: 65535, medium: 16777215, long: 4294967295}[(type._length || 'text').toLowerCase()]
			};
		} else if (type instanceof Sequelize.ENUM) {
			field = {format: 'enum', values: fieldParams.values, valueLabels: fieldParams.valueLabels};
		} else {
			field = {format: 'string'};
			if (type._length !== undefined) field.length = type._length;
		}

		if (fieldParams.format) field.format = fieldParams.format;

		// inherit field properties from field type templates
		forms.formatInherit(field);

		// define default
		if (fieldParams.defaultValue !== undefined && field.default === undefined) field.default = fieldParams.defaultValue + '';

		// define label
		field.label = fieldParams.label;

		return field;
	},

	// populate formData from DB model instance
	populateFromModelInstance: function(form, item) {
		var formData = {};

		_.forIn(form.fields, function(field, fieldName) {
			formData[fieldName] = forms.populateField(field, item.get(fieldName));
			if (field.additionalFields) {
				var dataName = fieldName.slice(0, -2);
				if (!item.hasOwnProperty(dataName)) throw new OverlookError('Form requires ' + dataName + ' to be loaded'); //xxx check this correctly identifies unloaded items
				var addItem = item[dataName];

				_.forEach(field.additionalFields, function(addFieldName) {
					if (addItem !== undefined && addItem !== null && addItem[addFieldName] === undefined) throw new OverlookError('Form requires ' + dataName + '.' + addFieldName + ' to be loaded');
					formData[dataName + _.capitalize(addFieldName)] = addItem ? addItem[addFieldName] : '';
				});
			}
		});

		return formData;
	},

	populateField: function(field, value) {
		// convert NULL to empy
		if (value == null) return '';

		// run populators
		_.forIn(field.populate, function(options, populatorName) {
			if (!_.isPlainObject(options)) options = {param: options};

			var populator = forms.populators[populatorName];
			if (!populator) throw new OverlookError('Populator ' + populatorName + ' does not exist');

			value = populator(value, options);
		});

		return value;
	},

	// populate formData with defaults - all fields empty
	populateDefaults: function(form) {
		var formData = {};

		_.forEach(form.fields, function(field, fieldName) {
			var value = '';
			if (field.default !== undefined) value = field.default;
			formData[fieldName] = value;

			if (field.additionalFields) {
				var dataName = fieldName.slice(0, -2);

				_.forEach(field.additionalFields, function(addFieldName) {
					formData[dataName + _.capitalize(addFieldName)] = '';
				});
			}
		});

		return formData;
	},

	// populate formData from POST (req.body)
	// filter out unexpected arrays or objects
	populateFromPost: function(form, body) {
		var formData = {},
			fields = form.fields;

		_.forIn(fields, function(field, fieldName) {
			forms.populateFieldFromPost(fieldName, body, formData);

			if (field.additionalFields) {
				var dataName = fieldName.slice(0, -2);

				_.forEach(field.additionalFields, function(addFieldName) {
					forms.populateFieldFromPost(dataName + _.capitalize(addFieldName), body, formData);
				});
			}
		});

		return formData;
	},

	populateFieldFromPost: function(fieldName, body, formData) {
		var value = body[fieldName];
		if (value === undefined) {
			value = '';
		} else if (_.isPlainObject(value) || Array.isArray(value)) {
			value = '';
		}

		formData[fieldName] = value;
	},

	// run all sanitize functions on form
	sanitize: function(form, formData) {
		_.forIn(form.fields, function(field, fieldName) {
			_.forIn(field.sanitize, function(options, sanitizerName) {
				if (!_.isPlainObject(options)) options = {param: options};

				var sanitizer = forms.sanitizers[sanitizerName];
				if (!sanitizer) throw new OverlookError('Sanitizer ' + sanitizerName + ' does not exist');

				formData[fieldName] = sanitizer(formData[fieldName], options);
			});

			// sanitize additional fields
			if (field.additionalFields) {
				var dataName = fieldName.slice(0, -2);

				_.forEach(field.additionalFields, function(addFieldName) {
					addFieldName = dataName + _.capitalize(addFieldName);
					formData[addFieldName] = forms.sanitizers.standard(formData[addFieldName]);
				});
			}
		});
	},

	// run all validate functions on form
	validate: function(form, formData, formErrors) {
		var errors = false;

		_.forIn(form.fields, function(field, fieldName) {
			var error = forms.validateField(formData[fieldName], fieldName, field, formData);

			if (error) {
				formErrors[fieldName] = error;
				errors = true;
			}
		});

		return !errors;
	},

	validateField: function(value, fieldName, field, formData) {
		// deal with empty fields
		if (value == '' && !field.requiredOverride) {
			if (field.required) return field.label + ' is required';
			return;
		}

		// run validators
		var error;
		_.forIn(field.validate, function(options, validatorName) {
			if (!_.isPlainObject(options)) options = {param: options};

			var validator = forms.validators[validatorName];
			if (!validator) throw new OverlookError('Validator ' + validatorName + ' does not exist');

			error = validator(value, options, fieldName, field, formData);
			if (error) return false;
		});

		if (error) return error.replace(/\%label/g, field.label);
	},

	conform: function(form, formData) {
		// run conformers on all fields
		var actData = {};
		_.forIn(form.fields, function(field, fieldName) {
			actData[fieldName] = forms.conformField(field, formData[fieldName]);

			// add additional fields to actData
			if (field.additionalFields) {
				var dataName = fieldName.slice(0, -2);

				_.forEach(field.additionalFields, function(addFieldName) {
					addFieldName = dataName + _.capitalize(addFieldName);

					// add field to actData only if main field is not populated
					if (formData[fieldName] == '') actData[addFieldName] = forms.conformField({conform: {}}, formData[addFieldName]);
				});
			}
		});

		return actData;
	},

	conformField: function(field, value) {
		// convert empty to NULL
		if (value == '') return null;

		// run conformers
		_.forIn(field.conform, function(options, conformerName) {
			if (!_.isPlainObject(options)) options = {param: options};

			var conformer = forms.conformers[conformerName];
			if (!conformer) throw new OverlookError('Conformer ' + conformerName + ' does not exist');

			value = conformer(value, options);
		});

		return value;
	},

	// inherits into field the properties of the field format
	formatInherit: function(field) {
		// get field type and check valid
		var format = field.format;
		if (!format) return field;

		var fieldFormat = formats[format];
		if (!fieldFormat) throw new OverlookError('Field format ' + format + ' is not defined');

		delete field.format;

		// inherit properties from field type
		_.forIn(fieldFormat, function(param, paramName) {
			if (field[paramName] === undefined) {
				field[paramName] = _.cloneDeep(param);
			} else if (_.isPlainObject(field[paramName])) {
				// copy values from fieldFormat (ordering from fieldFormat first, followed by from field, with field taking precedence)
				var oldParams = field[paramName];
				field[paramName] = _.cloneDeep(param);
				_.extend(field[paramName], oldParams);
				_.deleteFalsy(field[paramName]);
			}
		});

		// ensure sanitize, validate and conform defined
		_.forEach(['sanitize', 'validate', 'conform', 'populate'], function(param) {
			_.defaultValue(field, param, {});
		});

		// return field
		return field;
	}
};

// init types - cascade through all types, inheriting from parent types
(function() {
	while (true) {
		var someSkipped = false;
		_.forIn(formats, function(format) {
			var parentFormatName = format.format;
			if (parentFormatName) {
				if (formats[parentFormatName].format) {
					// this parent type has not yet inherited from it's own parent
					someSkipped = true;
				} else {
					forms.formatInherit(format);
				}
			}
		});

		if (!someSkipped) break;
	}
})();
