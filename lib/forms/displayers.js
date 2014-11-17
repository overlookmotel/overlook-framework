// --------------------
// Overlook
// Forms
// Displayers
// --------------------

// libraries
var _ = require('overlook-utils');

// imports
var populators = require('./populators');

// exports

exports = module.exports = {
	number: populators.number,
	
	boolean: function(val, options) { // jshint ignore:line
		return val ? 'Y' : 'N';
	},
	
	decimal: populators.decimal,
	
	currency: function(val, options) { // jshint ignore:line
		return '£' + val;
	},
	
	date: populators.date,
	time: populators.time,
	dateTime: populators.dateTime,
	
	email: function(val, options) { // jshint ignore:line
		return {html: '<a href="mailto:' + _.escapeHTML(val) + '">' + _.escapeHTML(val) + '</a>'};
	},
	url: function(val, options) { // jshint ignore:line
		return {html: '<a href="' + _.escapeHTML(val) + '" target="_new">' + _.escapeHTML(val) + '</a>'};
	},
	
	password: function() {
		return '********';
	}
};
