// --------------------
// localWorker model
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
        status: {
            type: Sequelize.ENUM('Starting', 'Started', 'Stopping', 'Stopped'),
            allowNull: false
        },
        jobs: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        }
    }
};
