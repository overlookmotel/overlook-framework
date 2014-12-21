// --------------------
// serverWorker model
// --------------------

// modules
var Sequelize = require('sequelize-extra');

// definition
module.exports = {
	fields: {
		serverId: {
			allowNull: false
		},
		workerId: {
			allowNull: false
		},
		status: {
			type: Sequelize.ENUM(
				'Starting',
				'Started',
				'Stopping',
				'Stopped'
			),
			allowNull: false,
			defaultValue: 'Stopped'
		}
	},
	options: {
		tableName: 'serversWorkers'
	}
};
