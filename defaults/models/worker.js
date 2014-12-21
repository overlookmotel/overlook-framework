// --------------------
// worker model
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
		}
	},
	manyToMany: {
		server: {
			through: 'serverWorker'
		}
	}
};
