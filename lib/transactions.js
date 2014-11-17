// --------------------
// Overlook
// Transactions
// Functions to start/commit/rollback transactions
// --------------------

// modules
var Promise = require('bluebird-extra');

// exports

exports = module.exports = {
	start: function() {
		return this.sequelize.transaction().bind(this)
		.then(function(transaction) {
			// store transaction in this obj
			this.transaction = transaction;
		});
	},

	commit: function() {
		if (!this.transaction) return Promise.resolve();
	
		return this.transaction.commit().bind(this)
		.then(function() {
			// delete transaction from this obj
			delete this.transaction;
		});
	},

	rollback: function() {
		if (!this.transaction) return Promise.resolve();
	
		return this.transaction.rollback().bind(this)
		.then(function() {
			// delete transaction from this obj
			delete this.transaction;
		})
		.catch(function(err) {
			// delete transaction from this obj
			delete this.transaction;
			throw err; //xxx is it neccesary to throw error again?
		});
	}
};
