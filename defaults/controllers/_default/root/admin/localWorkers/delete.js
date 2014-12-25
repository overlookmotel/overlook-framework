// --------------------
// Workers Local resource controller
// delete action (actually stop)
// --------------------

// exports

// action definition
exports = module.exports = {
    titleAction: 'Stop',

    // functions

    load: function() {
        // find worker
        this.route.actions.edit.findWorker.call(this);
    },

    act: function() {
        // find worker
        var worker = this.route.actions.edit.findWorker.call(this);

        if (worker.active) worker.stop();

        return true;
    },

    done: function() {
        return this.redirect('../', 'Stopping Worker ' + this.dataMain.name);
    }
};
