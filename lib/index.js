// --------------------
// Overlook
// --------------------

// modules
var Promise = require('bluebird-extra'),
	Sequelize = require('sequelize-extra'),
	_ = require('overlook-utils');

// libraries
var overlook = require('./overlook'),
	forms = require('./forms'),
	authentication = require('./authentication'),
	workers = require('./workers'),
	api = require('./api'),
	http = require('./http');

// exports
var Overlook = module.exports = function(options) {
	this.init(options);
};

// prototype
_.extend(Overlook.prototype, overlook);

// save Promise, Sequelize, Utils, forms etc to Overlook and prototype
var common = {
	Promise: Promise,
	Sequelize: Sequelize,
	_: _,
	forms: forms,
	authentication: authentication,
	api: api,
	http: http
};

_.extend(Overlook, common);
_.extend(Overlook.prototype, common);

Overlook.workers = workers;

// save reference to Overlook in prototype
Overlook.prototype.Overlook = Overlook;
