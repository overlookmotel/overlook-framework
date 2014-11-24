// --------------------
// Default resource controller
// index action
// --------------------

// modules
var Promise = require('bluebird-extra'),
	_ = require('overlook-utils');

// libraries
var forms = require('../../../../lib/forms');

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
			
			// remove field for parent name
			delete this.fields[this.route.parent.model.name + 'Id'];
		});
	},
	
	start: resourceIndexAction.start,
	
	/*load: function(defaultFn) {
		return defaultFn().bind(this)
		.then(this.loaded)
		.ifElse(function() {
			// set up options
			var options = {
				attributes: [],
				include: {model: this.model, attributes: ['id', 'name']}
			};
			this.loadOptions(options.include);
			
			// filter by parent
			options.where[this.parent.model.name + _.capitalize(this.parent.paramField)] = this.params[this.parent.param];
			
			// get from db
			return this.throughModel.findAndCountAll(options).bind(this)
			.then(function(result) {
				this.paging.pages = Math.ceil(result.count / options.limit);
				
				// save db result to data
				this.dataMain = this.data[this.model.namePlural] = result.rows;
			});
		});
	},*/
	
	load: resourceIndexAction.load,
	loadOptions: resourceIndexAction.loadOptions,
	
	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			var viewData = this.displayOptions.options.data = {};
			viewData[this.model.namePlural] = forms.getValuesByFields(this.dataMain, _.extend({id: {}}, this.fields));
			
			_.forEach(this.loadReferences, function(model) {
				viewData[model.namePlural] = forms.getValuesByFields(this.data[model.namePlural], {id: {}, name: {}});
			}, this);
			
			// put filters in display options, including filling in Name fields for open menus
			this.displayOptions.options.filters = this.filters;
			var filterNames = this.displayOptions.options.filterNames = {};
			
			return Promise.in(this.fields, function(field, fieldName) {
				if (field.widget != 'menuOpen') return;
				if (!this.filters[fieldName]) return;
				
				var referenceName = fieldName.slice(0, -2);
				var nameFieldName = referenceName + 'Name';
				if (this.filters[nameFieldName]) return;
				
				if (this.dataMain.length) {
					filterNames[nameFieldName] = this.dataMain[0][referenceName].name;
					return;
				}
				
				return this.models[referenceName].find({where: {id: this.filters[fieldName]}, attributes: ['name']}).bind(this)
				.then(function(item) {
					filterNames[nameFieldName] = item.name;
				});
			}.bind(this)).bind(this)
			.then(function() {
				this.displayOptions.options.sort = this.sort;
				this.displayOptions.options.sortDefault = this.sortDefault;
				this.displayOptions.options.paging = this.paging;
			});
		});
	}
};
