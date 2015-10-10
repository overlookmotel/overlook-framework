// --------------------
// Overlook
// fs
// --------------------

var fs = require('fs-extra-promise');

// libraries
var Promise = require('./promise');

// modules
module.exports = fs.usePromise(Promise);
