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
			allowNull: false
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
			allowNull: true,
			secret: true
		},
		cookieKey: {
			type: Sequelize.STRING(60),
			allowNull: true,
			secret: true
		},
		type: {
			type: Sequelize.STRING(10),
			allowNull: true,
			unique: true
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
