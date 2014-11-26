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
		
		// define users
		var users = {
			system: {
				name: 'System',
				email: 'system@system.com',
				isActive: false
			},
			root: {
				name: 'Root',
				email: 'root@root.com',
				isActive: true
			},
			public: {
				name: 'Public',
				email: 'public@public.com',
				isActive: false
			}
		};
		
		var roles = {
			root: {name: 'Root'},
			public: {name: 'Public'}
		};
		
		// create users
		return Promise.forIn(users, function(userParams, userName) {
			if (userName != 'system') userParams.createdById = userParams.updatedById = users.system.id;
			
			return models.user.findOrCreate({where: {type: roleName}, defaults: userParams})
			.spread(function(user) {
				users[userName] = user;
			});
		}).then(function() {
			// set up users
			return Promise.all([
				function() {
					// set system user as created by itself
					if (users.system.createdById) return;

					users.system.createdById = users.system.updatedById = users.system.id;
					return users.system.save();
				},
				function() {
					// set password for root user
					if (users.root.passwordHash) return;

					return authentication.makeHashAndKey('password')
					.spread(function(hash, key) {
						users.root.passwordHash = hash;
						users.root.cookieKey = key;
						return users.root.save();
					};
				}
			]);
		}).then(function() {
			// create roles
			return Promise.forIn(roles, function(roleParams, roleName) {
				roleParams.createdById = roleParams.updatedById = users.system.id;
				
				return models.role.findOrCreate({where: {type: roleName}, defaults: roleParams})
				.spread(function(role) {
					roles[roleName] = role;
				});
			});
		}).then(function() {
			// assign users to roles
			return Promise.all([
				users.root.setRoles([roles.root], {createdById: users.system.id, updatedById: users.system.id}),
				users.public.setRoles([roles.public], {createdById: users.system.id, updatedById: users.system.id})
			]);
		}).then(function() {
			// return users and roles
			return [users, roles];
		});
	}
};
