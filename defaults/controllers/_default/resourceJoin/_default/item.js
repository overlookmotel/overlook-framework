// --------------------
// Default resourceJoin controller
// Default item action
// --------------------

// modules
var _ = require('overlook-utils');

// imports
var resourceDefaultItemAction = require('../../resource/_default/item');

// exports

// action definition
exports = module.exports = {
	// functions
	
	load: resourceDefaultItemAction.load,
	loaded: resourceDefaultItemAction.loaded,
	loadFail: resourceDefaultItemAction.loadFail,
	accessFail: resourceDefaultItemAction.accessFail,
	
	makeTitle: function() {
		_.defaultValue(this, 'title', (this.titleAction ? this.titleAction + ' ' : '') + (this.dataMain ? this.dataMain[this.targetModel.name].name : this.titleItem));
	},
	
	makeBreadcrumbs: resourceDefaultItemAction.makeBreadcrumbs
};
