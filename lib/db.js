// --------------------
// Overlook
// Models initialisation
// --------------------

// modules
var Sequelize = require('sequelize-extra'),
	Promise = require('bluebird-extra'),
	_ = require('overlook-utils');

// libraries
var authentication = require('./authentication');

// exports

exports = module.exports = {
	init: function(dbOptions, modelsPath) {
		// init sequelize
		console.log('DB initialising');
		
		var options = {
			logging: console.log,
			define: {
				labels: true,
				camelThrough: true
			},
			hierarchy: {
				levelFieldAttributes: {secret: true}
			}
		};
		
		var sequelize = new Sequelize(dbOptions.database, dbOptions.user, dbOptions.password, options);
		
		// define models from model definitions files
		console.log('DB models importing from files');
		
		var defineOptions = {
			fields: {
				createdById: function(modelName) {
				  return {
						reference: 'user',
						asReverse: _.pluralize(modelName) + 'Created',
						allowNull: true
					};
				},
				updatedById: function(modelName) {
					return {
						reference: 'user',
						asReverse: _.pluralize(modelName) + 'Updated',
						allowNull: true
					};
				}
			},
			primaryKeyType: Sequelize.INTEGER.UNSIGNED,
			primaryKeyFirst: true,
			autoAssociate: true,
			associateThrough: true,
			onDelete: 'restrict',
			onUpdate: 'restrict',
			loadOptions: {
				flatten: true,
				flattenPrefix: true,
				flattenCamel: true
			}
		};
		
		sequelize.defineFromFolder(modelsPath, defineOptions);
		
		// initialise virtual fields
		sequelize.initVirtualFields();
		
		console.log('DB initialised');
		
		// done
		return sequelize;
	},
	
	stock: function(sequelize) {
		// initialise public and root users
		var models = sequelize.models;
		
		// create system, root and public users
		var systemUser, rootUser, publicUser, rootRole, publicRole;
		
		return Promise.try(function() {
			// create system user
			return models.user.findOrCreate({where: {isSystem: true}, defaults: {login: 'system', email: 'system@system.com', isActive: false}})
			.spread(function(user, created) {
				systemUser = user;
				if (created) return user.updateAttributes({createdById: user.id, updatedById: user.id});
			});
		}).then(function() {
			// create root user
			return authentication.makeHashAndKey('password')
			.spread(function(hash, key) {
				return models.user.findOrCreate({where: {isRoot: true}, defaults: {login: 'root', email: 'root@root.com', passwordHash: hash, cookieKey: key, createdById: systemUser.id, updatedById: systemUser.id}});
			}).spread(function(user) {
				rootUser = user;
			});
		}).then(function() {
			// create public user
			return models.user.findOrCreate({where: {isPublic: true}, defaults: {login: 'public', email: 'public@public.com', isActive: false, createdById: systemUser.id, updatedById: systemUser.id}})
			.spread(function(user) {
				publicUser = user;
			});
		}).then(function() {
			// create root role and assign to root user
			return models.role.findOrCreate({where: {isRoot: true}, defaults: {name: 'root', createdById: systemUser.id, updatedById: systemUser.id}})
			.spread(function(role) {
				rootRole = role;
				return rootUser.setRoles([role], {createdById: systemUser.id, updatedById: systemUser.id});
			});
		}).then(function() {
			// create public role and assign to public user
			return models.role.findOrCreate({where: {isPublic: true}, defaults: {name: 'public', createdById: systemUser.id, updatedById: systemUser.id}})
			.spread(function(role) {
				publicRole = role;
				return publicUser.setRoles([role], {createdById: systemUser.id, updatedById: systemUser.id});
			});
		}).then(function() {
			// return users and roles
			return [systemUser, rootUser, publicUser, rootRole, publicRole];
		});
	}
};
