// --------------------
// Default controller
// Default singular action
// --------------------

// libraries
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions

	makeTitle: function() {
		_.defaultValue(this, 'title', (this.titleAction ? this.titleAction + ' ' : '') + this.titleItem);
	}
};
