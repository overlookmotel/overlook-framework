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
	makeTitle: resourceDefaultItemAction.makeTitle,
	makeBreadcrumbs: resourceDefaultItemAction.makeBreadcrumbs
};
