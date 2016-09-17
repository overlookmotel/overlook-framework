// --------------------
// Overlook
// Crypto
// Creating hashes etc
// --------------------

// modules
var bcrypt = require('bcrypt');

// libraries
var Promise = require('./promise');

// promisify bcrypt
Promise.promisifyAll(bcrypt);

// exports

exports = module.exports = {
	// hash password
	makeHash: function(password) {
		return bcrypt.genSaltAsync(10).then(function(salt) {
			return bcrypt.hashAsync(password, salt);
		});
	},

	// make secret key for cookie
	//xxx better way to make keys - use proper random number generator
	makeKey: function() {
		return bcrypt.genSaltAsync(10);
	},

	// check password against hash
	checkPassword: function(password, hash) {
		return bcrypt.compareAsync(password, hash);
	}
};
