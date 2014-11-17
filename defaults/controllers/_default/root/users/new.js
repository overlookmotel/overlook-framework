// --------------------
// Users resource controller
// new action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var forms = require('../../../../../lib/forms'),
	authentication = require('../../../../../lib/authentication');

// exports

// action definition
exports = module.exports = {
	// functions
	
	initForm: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			// modify form
			_.forEach(['isSystem', 'isRoot', 'isPublic'], function(fieldName) {
				delete this.form.fields[fieldName];
			}, this);
			
			forms.addField(this.form, 'password', {format: 'password', required: true});
		});
	},
	
	process: function() {
		// create password hash
		return authentication.makeHashAndKey(this.actData.password).bind(this)
		.spread(function(hash, key) {
			// store hash and key in actData
			this.actData.passwordHash = hash;
			this.actData.cookieKey = key;
			delete this.actData.password;
		});
	}
};
