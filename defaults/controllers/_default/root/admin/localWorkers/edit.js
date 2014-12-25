// --------------------
// Workers Local resource controller
// edit action (actually start)
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
    titleAction: 'Start',

    // functions

    load: function() {
        // find worker
        this.findWorker();
    },

    validate: function() {
        return true;
    },

    act: function() {
        // find worker
        var worker = this.findWorker();

        if (!worker.active) worker.start();

        return true;
    },

    done: function() {
        return this.redirect('../', 'Started Worker ' + this.dataMain.name);
    },

    findWorker: function() {
        var id = this.params.localWorkerId;

        var worker = _.find(this.overlook.workers, function(worker) {
            if (worker.Worker.workerId == id) return true;
        }.bind(this));

        if (!worker) return;

        var Worker = worker.Worker;

        this.dataMain = this.data.localWorker = this.model.build({
            id: Worker.workerId,
            name: Worker.workerName,
            status: worker.status
        });

        return worker;
    }
};
