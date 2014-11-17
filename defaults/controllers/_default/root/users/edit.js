// --------------------
// Users resource controller
// edit action
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
	// functions
	
	access: function(defaultFn) {
		return defaultFn().bind(this)
		.ifElse(function() {
			// check if is system/public user, and say no access if so
			return !this.dataMain.isSystem && !this.dataMain.isPublic;
		}, function() {
			return false;
		});
	},
	
	process: function() {
		// run process action from new.js
		return this.route.actions.new.process.call(this);
	},
	
	act: function(defaultFn) {
		// if root user, check uneditable fields haven't been edited
		var user = this.dataMain;
		if (user.isRoot) {
			_.forEach(['login', 'isActive'], function(fieldName) {
				if (this.actData[fieldName] != user[fieldName]) {
					// field can't be changed
					this.actResult = {error: 'cannotEdit', field: fieldName, value: user[fieldName]};
					return false;
				}
			}.bind(this));
			
			if (this.actResult && this.actResult.error) return false;
		}
		
		// run default action
		return defaultFn();
	}
};
