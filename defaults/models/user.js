// --------------------
// User model
// --------------------

// modules
var Sequelize = require('sequelize-extra');

// definition
module.exports = {
	fields: {
		name: {
			type: Sequelize.STRING(100),
			allowNull: false,
			unique: true
		},
		email: {
			type: Sequelize.STRING(50),
			format: 'email',
			widget: 'text',
			allowNull: false,
			unique: true
		},
		passwordHash: {
			type: Sequelize.STRING(60),
			format: 'password',
			secret: true,
			allowNull: true
		},
		cookieKey: {
			type: Sequelize.STRING(60),
			secret: true,
			allowNull: true
		},
		isSystem: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		isRoot: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		isPublic: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true
		}
	},
	manyToMany: {
		role: {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		}
	}
};
