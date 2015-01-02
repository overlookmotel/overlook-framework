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
		if (val === undefined || val === null) return '';
		return val ? 'Y' : 'N';
	},

	decimal: populators.decimal,

	currency: function(val, options) { // jshint ignore:line
		return '£' + val;
	},

	percent: function(val, options) { // jshint ignore:line
		return val + '%';
	},

	date: populators.date,
	time: populators.time,
	dateTime: populators.dateTime,

	textbox: function(val, options) { // jshint ignore:line
		return {html: _.escapeHTML(val).replace(/\n/g, '<br />')};
	},

	email: function(val, options) { // jshint ignore:line
		return {html: '<a href="mailto:' + _.escapeHTML(val) + '">' + _.escapeHTML(val) + '</a>'};
	},
	url: function(val, options) { // jshint ignore:line
		return {html: '<a href="' + _.escapeHTML(val) + '" target="_new">' + _.escapeHTML(val) + '</a>'};
	},

	password: function() {
		return '********';
	},

	json: function(val, options) { // jshint ignore:line
		var obj;
		try {
			obj = JSON.parse(val);
		} catch(err) {
			return '[Invalid JSON]';
		}

		return {html: _.escapeHTML(JSON.stringify(obj, null, '\t')).replace(/<br \/>\t+/g, function(match) {return '<br />' + _.repeat('&nbsp;&nbsp;&nbsp;&nbsp;', match.length - 6);})};
	},

	dataSize: function(val, options) {
		var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

		var result,
			v = val;
		_.forEach(sizes, function(size) {
			if (v < 1024) {
				result = v.toPrecision(3) + ' ' + size;
				return false;
			}

			v = v / 1024;
		});

		if (!result) result = v.toPrecision(3) + ' ' + sizes[sizes.length - 1];

		if (options.full) result += ' (' + val + ' B)';

		return result;
	}
};
