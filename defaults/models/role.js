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
		type: {
			type: Sequelize.STRING(10),
			allowNull: true,
			unique: true
		}
	},
	manyToMany: {
		permission: {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		}
	}
};
