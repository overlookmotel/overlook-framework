// --------------------
// Servers resource controller
// edit action
// --------------------

// exports

// action definition
exports = module.exports = {
	// functions
	
	process: function() {
		return this.route.actions.new.process.call(this);
	}
};
