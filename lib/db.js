// --------------------
// Overlook
// Models initialization
// --------------------

// modules
var Sequelize = require('sequelize-extra'),
	_ = require('overlook-utils');

// libraries
var Promise = require('./promise'),
	authentication = require('./authentication');

// exports

exports = module.exports = {
	init: function(dbOptions, modelsPath, overlook) {
		// init sequelize
		overlook.log('DB initializing');

		var options = {
			logging: function(msg) {
				// get requestId from CLS
				var logObj = {};
				if (overlook.cls) {
					var requestId = overlook.cls.get('requestId');
					if (requestId) logObj.requestId = requestId;
				}

				// parse Sequelize log output
				var match = msg.match(/^Executing \(([^)]*)\):\s+([\s\S]*)$/);

				// if not SQL, log as Sequelize output
				if (!match) {
					logObj.msg = msg;
					return overlook.log.debug('Sequelize output', logObj);
				}

				// is SQL - log transaction ID and SQL
				if (match[1] != 'default') logObj.transaction = match[1];
				logObj.sql = match[2];
				overlook.log.debug('SQL', logObj);
			},
			define: {
				labels: true,
				camelThrough: true
			},
			hierarchy: {
				levelFieldAttributes: {secret: true}
			}
		};

		if (dbOptions.charset) options.define.charset = dbOptions.charset;
		if (dbOptions.collate) options.define.collate = dbOptions.collate;

		var sequelize = new Sequelize(dbOptions.database, dbOptions.user, dbOptions.password, options);

		// define models from model definitions files
		overlook.log('DB models importing from files');

		var defineOptions = {
			fields: {
				createdById: function(modelName) {
				  return {
						reference: 'user',
						asReverse: _.pluralize(modelName) + 'Created',
						allowNull: false
					};
				},
				updatedById: function(modelName) {
					return {
						reference: 'user',
						asReverse: _.pluralize(modelName) + 'Updated',
						allowNull: false
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

		// initialize virtual fields
		sequelize.initVirtualFields();

		overlook.log('DB initialized');

		// done
		return sequelize;
	},

	stock: function(sequelize) {
		// initialize public and root users
		var models = sequelize.models;

		// define users, roles, permissions
		var users = {
			system: {
				name: 'System',
				email: 'system@system.com',
				isActive: false,
				isInitialized: true
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
			user: {name: 'User'},
			api: {name: 'API'}
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
				users.system.setRoles([roles.root], {createdById: systemId, updatedById: systemId}),
				users.root.setRoles([roles.root], {createdById: systemId, updatedById: systemId}),
				users.public.setRoles([roles.public], {createdById: systemId, updatedById: systemId}),

				// assign all permissions to root role
				models.permission.findAll()
				.map(function(permission) {
					return roles.root.addPermission(permission, {createdById: systemId, updatedById: systemId});
				}),

				// assign permissions to other roles
				roles.admin.addPermission(permissions.admin, {createdById: systemId, updatedById: systemId}),
				roles.user.addPermission(permissions.user, {createdById: systemId, updatedById: systemId}),

				// assign user role to all non-special users
				models.user.findAll({where: {type: null}})
				.map(function(user) {
					return user.addRole(roles.user, {createdById: systemId, updatedById: systemId});
				})
			]);
		}).then(function() {
			// return users, roles, permissions
			return [users, roles, permissions];
		});
	}
};
