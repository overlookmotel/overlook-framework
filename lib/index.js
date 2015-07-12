// --------------------
// Overlook
// --------------------

// modules
var Promise = require('bluebird-extra'),
	Sequelize = require('sequelize-extra'),
	clsModule = require('continuation-local-storage'),
	_ = require('overlook-utils');

// libraries
var overlook = require('./overlook'),
	forms = require('./forms'),
	crypto = require('./crypto'),
	authentication = require('./authentication'),
	api = require('./api'),
	http = require('./http');

// exports
var Overlook = module.exports = function(options) {
	this.init(options);
};

// prototype
_.extend(Overlook.prototype, overlook);

// create CLS namespace
var cls = clsModule.createNamespace('overlook');

// attach CLS namespace to Sequelize
Sequelize.cls = cls;

// save Promise, Sequelize, Utils, forms etc to Overlook and prototype
var common = {
	Promise: Promise,
	Sequelize: Sequelize,
	_: _,
	forms: forms,
	crypto: crypto,
	authentication: authentication,
	api: api,
	http: http,
	cls: cls
};

_.extend(Overlook, common);
_.extend(Overlook.prototype, common);

// save reference to Overlook in prototype
Overlook.prototype.Overlook = Overlook;
