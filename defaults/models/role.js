// --------------------
// Role model
// --------------------

// modules
var Sequelize = require('sequelize-extra');

// definition
module.exports = {
	fields: {
		name: {
			type: Sequelize.STRING(20),
			allowNull: false,
			unique: true
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
		}
	},
	manyToMany: {
		permission: {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		}
	}
};
