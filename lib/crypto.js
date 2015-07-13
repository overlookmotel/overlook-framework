// --------------------
// Overlook
// Crypto
// Creating hashes etc
// --------------------

// modules
var bcrypt = require('bcrypt');

// libraries
var Promise = require('./promise');

// exports

exports = module.exports = {
	// hash password
	makeHash: function(password) {
		return Promise.promisify(bcrypt.genSalt)(10).then(function(salt) {
			return Promise.promisify(bcrypt.hash)(password, salt);
		});
	},

	// make secret key for cookie
	//xxx better way to make keys - use proper random number generator
	makeKey: function() {
		return Promise.promisify(bcrypt.genSalt)(10);
	},

	// check password against hash
	checkPassword: function(password, hash) {
		return Promise.promisify(bcrypt.compare)(password, hash);
	}
};
