// --------------------
// process model
// --------------------

// modules
var Sequelize = require('sequelize-extra');

// definition
module.exports = {
	fields: {
		name: {
			type: Sequelize.STRING(50),
			allowNull: false,
			unique: true
		},
		workerId: {
			allowNull: false
		},
		afterProcessId: {
			reference: 'process',
			asReverse: 'beforeProcess',
			allowNull: true
		},
		requiresResource: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: 0
		}
	},
	options: {
		hierarchy: {
			foreignKey: 'afterProcessId'
		}
	}
};
