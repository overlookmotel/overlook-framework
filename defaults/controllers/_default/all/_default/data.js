// --------------------
// Default controller
// Default data action
// --------------------

// exports

// action definition
exports = module.exports = {
    // functions

    makeDisplayOptions: function(defaultFn) {
        return defaultFn().bind(this)
        .then(function() {
            this.displayOptions.options.data = this.sequelize.Sequelize.getValues(this.data);
        });
    }
};
