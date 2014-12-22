// --------------------
// Overlook
// Forms
// Conformers
// --------------------

// libraries
var _ = require('overlook-utils');

// exports

// NB conformers do not have to handle empty values - these are converted to NULL by conformField
var conformers = module.exports = {
	number: function(val, options, formData) { // jshint ignore:line
		return val * 1;
	},
	
	boolean: function(val, options, formData) { // jshint ignore:line
		return val == '1';
	},
	booleanNull: function(val, options, formData) { // jshint ignore:line
		if (val == '1') return true;
		if (val == '0') return false;
		return null;
	},
	
	decimal: function(val, options, formData) { // jshint ignore:line
		// put zero before decimal point if there isn't one
		if (val.substr(0, 1) == '.') {
			val = '0' + val;
		} else if (val.substr(0, 2) == '-.') {
			val = '-0' + val.substr(2);
		}
		
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
	
	date: function(val, options, formData) { // jshint ignore:line
		// replace dots with slashes
		val = val.replace(/\./g, '/');
		
		// split into parts
		var parts = val.split('/');
		
		// add year if not provided, or covert YY form to YYYY
		if (parts.length == 2) {
			parts[2] = new Date().getFullYear();
		} else if (parts[2].length == 2) {
			parts[2] = '20' + parts[2];
		}
		
		// zero-pad day and month
		if (parts[0].length == 1) parts[0] = '0' + parts[0];
		if (parts[1].length == 1) parts[1] = '0' + parts[1];
		
		// join up parts again
		val = parts.join('/');
		
		// convert to date object + return
		return _.stringToDate(val);
	},
	time: function(val, options, formData) { // jshint ignore:line
		// replace dots with colons + remove spaces
		val = val.replace(/\./g, ':').replace(/\s/g, '');
		
		// split into parts
		var match = val.match(/^(\d{1,2})(\:([0-5]\d))?(am|pm)?$/i);
		
		// get hours and minutes
		var hours = match[1] * 1,
			minutes = match[3] || '00';
		
		// if am/pm specified, convert to 24hr clock
		if (match[4]) {
			if (match[4].toLowerCase() == 'am') {
				if (hours == 12) hours = 0;
			} else {
				if (hours < 12) hours += 12;
			}
		}
		
		// return time
		return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':00';
	},
	dateTime: function(val, options, formData) { // jshint ignore:line
		var match = val.match(/^([^ ]+) (.+)$/);
		
		return _.stringToDateTime(_.dateToString(conformers.date(match[1])) + ' ' + conformers.time(match[2]));
	},
	
	email: function(val, options, formData) { // jshint ignore:line
		// convert to lower case and convert @googlemail.com to @gmail.com
		return val.toLowerCase().replace(/@googlemail\.com$/, '@gmail.com');
	},
	url: function(val, options, formData) { // jshint ignore:line
		var match = val.match(/^(?:([\w\-]+):\/\/)?((?:[^\.\/]+\.)+[^\.\/]+)(\/.*)?$/);
		if (!match[1]) val = 'http://' + val;
		if (!match[3]) val += '/';
		
		return val;
	},
	
	json: function(val, options, formData) { // jshint ignore:line
		return JSON.stringify(JSON.parse(val));
	},
	
	intCollection: function(val, options, formData) { // jshint ignore:line
		return val.replace(/\s/g, '').split(',').map(function(part) {return part * 1;});
	}
};
