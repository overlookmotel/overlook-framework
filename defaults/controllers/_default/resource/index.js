// --------------------
// Default resource controller
// index action
// --------------------

// modules
var Promise = require('bluebird-extra'),
	_ = require('overlook-utils');

// libraries
var forms = require('../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// variables
	
	sortDefault: 'name',
	
	// functions
	
	init: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// make fields
			this.fields = forms.createFieldsFromModel(this.route.model);
			
			// make form
			this.form = forms.createFormFromModel(this.route.model);
			_.moveValue(this, this.form, 'loadReferences');
			delete this.form;
		});
	},
	
	start: function() {
		// get paging + sorting
		this.paging = {page: this.query.p * 1 || 1};
		
		// create sort order
		this.sort = this.query.s;
		if (this.sort === undefined) this.sort = this.sortDefault;
		
		// create filters
		this.filters = {};
		_.forIn(this.query, function(value, attribute) {
			if (_.startsWith(attribute, 'f')) this.filters[_.uncapitalize(attribute.slice(1))] = value;
		}, this);
	},
	
	load: function(defaultFn) {
		return defaultFn().bind(this)
		.then(this.loaded)
		.ifElse(function() {
			// set up options
			var options = {include: {all: 'One', attributes: ['id', 'name']}};
			this.loadOptions.call(this, options);
			
			// filter by parent resources
			if (this.parentResources) {
				var parentResource = this.parentResources[this.parentResources.length - 1];
				options.where[parentResource.model.name + _.capitalize(parentResource.paramField)] = this.params[parentResource.param];
			}
			
			// get from db
			return this.model.findAndCountAll(options).bind(this)
			.then(function(result) {
				this.paging.pages = Math.ceil(result.count / options.limit);
				
				// save db result to data
				this.dataMain = this.data[this.model.namePlural] = result.rows;
			});
		});
	},
	
	loadOptions: function(options) {
		// set filters
		options.where = {};
		
		_.forIn(this.filters, function(value, attribute) {
			var field = this.fields[attribute];
			if (field) {
				if (field.mainType == 'string') {
					options.where[attribute] = {like: '%' + value + '%'};
				} else if (field.mainType == 'date') {
					value = forms.conformers.date(value);
					this.filters[attribute] = _.dateToString(value);
					options.where[attribute] = {gte: value};
				} else {
					options.where[attribute] = value;
				}
			} else if (_.endsWith(attribute, 'Name')) {
				field = this.fields[attribute.slice(0, -4) + 'Id'];
				if (field && field.reference) options.where[attribute.slice(0, -4) + '.name'] = {like: '%' + value + '%'};
			}
		}, this);
		
		// set sort order
		if (this.sort) {
			var order;
			var attribute = this.sort;
			if (_.startsWith(attribute, '-')) {
				attribute = attribute.slice(1);
				order = [attribute, 'DESC'];
			} else {
				order = [attribute, 'ASC'];
			}
			
			var reference = this.model.rawAttributes[attribute] && this.model.rawAttributes[attribute].reference;
			if (reference) {
				var as = attribute.slice(0, -2);
				if (as != reference) {
					order.unshift({model: this.models[reference], as: as});
				} else {
					order.unshift(this.models[reference]);
				}
				order[1] = 'name';
			}
			
			options.order = [order];
		} else {
			options.order = [];
		}
		
		options.order.push(['id', 'ASC']);
		
		// set paging
		var pageLength = this.overlook.options.general.pageLength;
		options.limit = pageLength;
		options.offset = pageLength * (this.paging.page - 1);
	},
	
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
