// --------------------
// Overlook
// --------------------

// modules
var Sequelize = require('sequelize-extra'),
	clsModule = require('continuation-local-storage'),
	promisifyAny = require('promisify-any'),
	_ = require('overlook-utils');

// libraries
var overlook = require('./overlook'),
	errors = require('./errors'),
	Promise = require('./promise'),
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

// errors
_.extend(Overlook, errors);

// create CLS namespace
var cls = clsModule.createNamespace('overlook');

// attach CLS namespace to Sequelize
Sequelize.cls = cls;

// promisifyAny uses Sequelize Promise
promisifyAny = promisifyAny.use(Promise);

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
	cls: cls,
	promisifyAny: promisifyAny
};

_.extend(Overlook, common);
_.extend(Overlook.prototype, common);

// save reference to Overlook in prototype
Overlook.prototype.Overlook = Overlook;
