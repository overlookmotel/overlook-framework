// --------------------
// Overlook
// Forms
// Validators
// --------------------

// exports

var validators = module.exports = {
	minLen: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if (val.length >= options.param) return;
	
		return '%label must be at least ' + options.param + ' letters';
	},
	maxLen: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if (val.length <= options.param) return;
	
		return '%label cannot be longer than ' + options.param + ' letters';
	},

	int: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if ((val + '').match(/^-?[0-9]+$/)) return;
	
		return '%label must be a whole number';
	},
	intPos: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if ((val + '').match(/^[0-9]+$/)) return;
	
		return '%label must be a positive whole number';
	},
	
	decimal: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if (val.search(/^\-?([0-9]*\.)?[0-9]+$/) == -1) return '%label must be a decimal number';
		
		var pos = val.indexOf('.');
		if (pos == -1) return;
		
		if (options.scale && val.length - pos - 1 > options.scale) return '%label must have no more than ' + options.scale + ' decimal places';
	},
	
	percent: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if ((val + '').match(/^[0-9]+$/) && val * 1 <= 100) return;
	
		return '%label must be a percentage (between 0 and 100)';
	},
	
	date: function(val, options, fieldName, field, formData) { // jshint ignore:line
		// replace dots with slashes
		val = val.replace(/\./g, '/');
		
		var success = (function() {
			// check all characters valid
			if (val.search(/[^0-9\/]/) != -1) return false;

			// split into parts and check correct form
			var parts = val.split('/');
			if (parts.length < 2 || parts.length > 3) return false;

			// deal with year
			if (parts.length == 2) {
				parts[2] = new Date().getFullYear();
			} else if (parts[2].length == 2) {
				parts[2] = '20' + parts[2];
			} else if (parts[2].length != 4) {
				return false;
			}
			var year = parts[2] * 1;

			// check month
			var month = parts[1] * 1;
			if (month < 1 || month > 12) return false;

			// check day
			var day = parts[0] * 1;
			var monthDays = new Date(year, month, 0).getDate();
			if (day < 1 || day > monthDays) return false;
			
			// all ok
			return true;
		})();
		
		if (!success) return '%label must be a valid date (dd/mm/yyyy)';
	},
	time: function(val, options, fieldName, field, formData) { // jshint ignore:line
		// replace dots with colons + remove spaces
		val = val.replace(/\./g, ':').replace(/\s/g, '');
		
		var success = (function() {
			// check format correct
			var match = val.match(/^(\d{1,2})(\:([0-5]\d))?(am|pm)?$/i);
			if (!match) return false;
			
			// check hour is valid
			var hour = match[1] * 1;
			if (match[4]) {
				// am/pm specified
				if (hour < 1 || hour > 12) return false;
			} else {
				// 24 hour clock
				if (hour > 23) return false;
			}
			
			// all ok
			return true;
		})();
		
		if (!success) return '%label must be a valid time (hh:mm or hh:mm am/pm)';
	},
	dateTime: function(val, options, fieldName, field, formData) { // jshint ignore:line
		var match = val.match(/^([^ ]+) +(.+)$/);
		if (!match || validators.date(match[1]) || validators.time(match[2])) return '%label must be a valid date & time (dd/mm/yy hh:mm)';
	},
	
	enum: function(val, options, fieldName, field, formData) { // jshint ignore:line
		if (field.values.indexOf(val) == -1) return 'You must select one of the options for %label';
	},
	
	email: function(val, options, fieldName, field, formData) { // jshint ignore:line
		var match = val.match(/^[\w.\-]+@([\w.\-]+\.)+[\w.\-]+$/);
		if (!match) return '%label must be a valid email address';
	},
	url: function(val, options, fieldName, field, formData) { // jshint ignore:line
		var match = val.match(/^(?:([\w\-]+):\/\/)?((?:[^\.\/]+\.)+[^\.\/]+)(\/.*)?$/);
		if (!match) return '%label must be a valid URL';
		if (match[1] && ['http', 'https'].indexOf(match[1]) == -1) return '%label must be an http:// or https:// URL';
	},
	
	menuOpen: function(val, options, fieldName, field, formData) {
		if (field.required) {
			// check either id or name filled in
			var nameFieldName = fieldName.slice(0, -2) + 'Name';
			if (val == '' && formData[nameFieldName] == '') return field.label + ' is required';
		}
		
		// check id is valid
		if (val != '') return validators.intPos(val, options, fieldName, field, formData);
	}
};
