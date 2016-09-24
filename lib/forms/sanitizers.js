// --------------------
// Overlook
// Forms
// Sanitizers
// --------------------

// exports

exports = module.exports = {
	standard: function(val) {
		return (val + '').replace(/[\r\n\t]+/g, ' ') // replace line breaks and tabs with space
			.replace(/  +/g, ' ') // replace double space with single space
			.replace(/^ | $/g, ''); // trim space off start and end
	},
	textbox: function(val) {
		return (val + '').replace(/\r+/g, '\n') // replace \r with \n
			.replace(/\t/g, ' ') // replace tabs with spaces
			.replace(/  +/g, ' ') // replace double space with single space
			.replace(/ \n|\n /g, '\n') // remove space before/after \n
			.replace(/\n\n+/g, '\n') // replace double \n with single \n
			.replace(/^[ \n]|[ \n]$/g, ''); // trim space and \n off start and end
	},
	textboxSpaced: function(val) {
		return (val + '').replace(/\r\n?/g, '\n') // replace \r\n with \n
			.replace(/\t/g, ' ') // replace tabs with spaces
			.replace(/  +/g, ' ') // replace double space with single space
			.replace(/ \n|\n /g, '\n') // remove space before/after \n
			.replace(/^[ \n]|[ \n]$/g, ''); // trim space and \n off start and end
	},
	boolean: function(val) {
		return (val == '1') ? '1' : '0';
	},
	booleanNull: function(val) {
		if (val == '1' || val == '0') return val;
		return '';
	}
};
