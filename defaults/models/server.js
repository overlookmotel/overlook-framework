// --------------------
// server model
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
		passwordHash: {
			type: Sequelize.STRING(60),
			format: 'password',
			allowNull: true,
			secret: true
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true
		}
	}
};
