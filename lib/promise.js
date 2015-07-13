// --------------------
// Overlook
// Promise
// --------------------

// modules
var BluebirdExtra = require('bluebird-extra'),
    Sequelize = require('sequelize-extra');

// exports
module.exports = BluebirdExtra.usePromise(Sequelize.Promise);
