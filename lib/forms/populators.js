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
	
	decimal: function(val, options) {
		val = val + '';
		
		// add decimal places if not enough
		if (options.scale) {
			var pos = val.indexOf('.');
			if (pos == -1) {
				val += '.' + _.repeat('0', options.scale);
			} else {
				var decimalPlacesMissing = options.scale - (val.length - pos - 1);
				if (decimalPlacesMissing) val += _.repeat('0', decimalPlacesMissing);
			}
		}
		
		return val;
	},
	
	date: function(val, options) { // jshint ignore:line
		// convert to string
		return _.dateToString(val);
	},
	time: function(val, options) { // jshint ignore:line
		//xxx write this
		return val;
	},
	dateTime: function(val, options) { // jshint ignore:line
		//xxx write this
		return val;
	}
};
