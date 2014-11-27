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
		
		// define users, roles, permissions
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
			admin: {name: 'Admin'},
			user: {name: 'User'},
			public: {name: 'Public'}
		};
		
		var permissions = {
			root: {name: 'Root'},
			admin: {name: 'Admin'},
			user: {name: 'User'}
		};
		
		// create users
		var systemId;
		return Promise.try(function() {
			// create system user
			return models.user.findOrCreate({where: {type: 'system'}, defaults: users.system})
			.spread(function(user, created) {
				users.system = user;
				systemId = user.id;
				
				// record system user as created by itself
				if (created) {
					user.createdById = user.updatedById = systemId;
					return user.save();
				}
			});
		}).then(function() {
			return Promise.all([
				// create all other users
				Promise.forIn(users, function(userParams, userName) {
					if (userName == 'system') return;

					userParams.createdById = userParams.updatedById = systemId;

					return models.user.findOrCreate({where: {type: userName}, defaults: userParams})
					.spread(function(user) {
						users[userName] = user;
					});
				}),
				
				// create roles
				Promise.forIn(roles, function(roleParams, roleName) {
					roleParams.createdById = roleParams.updatedById = systemId;

					return models.role.findOrCreate({where: {type: roleName}, defaults: roleParams})
					.spread(function(role) {
						roles[roleName] = role;
					});
				}),
				
				// create permissions
				Promise.forIn(permissions, function(permissionParams, permissionName) {
					permissionParams.createdById = permissionParams.updatedById = systemId;

					return models.permission.findOrCreate({where: {type: permissionName}, defaults: permissionParams})
					.spread(function(permission) {
						permissions[permissionName] = permission;
					});
				})
			]);
		}).then(function() {
			return Promise.all([
				// set password for root user
				(function() {
					if (users.root.passwordHash) return;

					return authentication.makeHashAndKey('password')
					.spread(function(hash, key) {
						users.root.passwordHash = hash;
						users.root.cookieKey = key;
						return users.root.save();
					});
				})(),
				
				// assign users to roles
				users.root.setRoles([roles.root], {createdById: systemId, updatedById: systemId}),
				users.public.setRoles([roles.public], {createdById: systemId, updatedById: systemId}),
				
				// assign all permissions to root role
				models.permission.findAll()
				.map(function(permission) {
					return roles.root.addPermission(permission, {createdById: systemId, updatedById: systemId});
				}),
				
				// assign permissions to other roles
				roles.admin.addPermission(permissions.admin, {createdById: systemId, updatedById: systemId}),
				roles.user.addPermission(permissions.user, {createdById: systemId, updatedById: systemId})
			]);
		}).then(function() {
			// return users, roles, permissions
			return [users, roles, permissions];
		});
	}
};
