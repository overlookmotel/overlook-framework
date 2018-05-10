// --------------------
// Overlook
// Forms
// Populators
// --------------------

// libraries
var _ = require('overlook-utils');

// exports

exports = module.exports = {
	number: function(val, options) { // jshint ignore:line
		return val + '';
	},

	boolean: function(val, options) { // jshint ignore:line
		return val ? '1' : '0';
	},
	booleanNull: function(val, options) { // jshint ignore:line
		if (val === undefined || val === null) return '';
		return val ? '1' : '0';
	},

	decimal: function(val, options) {
		return val.toFixed(options.scale);
	},

	date: function(val, options) { // jshint ignore:line
		// convert to string
		return _.dateToString(val);
	},
	time: function(val, options) { // jshint ignore:line
		return val.slice(0, 5);
	},
	dateTime: function(val, options) { // jshint ignore:line
		return _.dateTimeToString(val).slice(0, 16);
	}
};
