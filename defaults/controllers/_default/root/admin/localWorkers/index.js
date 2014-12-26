// --------------------
// Workers Local resource controller
// index action
// --------------------

// modules
var _ = require('overlook-utils');

// exports

// action definition
exports = module.exports = {
    // functions

    load: function() {
        // get workers from overlook.workers
        var workers = [];

        _.forIn(this.overlook.workers, function(worker, workerName) {
            var Worker = worker.Worker;

            var item = this.model.build({
                id: Worker.workerId,
                name: _.capitalize(workerName),
                status: worker.status,
                jobs: worker.jobs.length
            });

            workers.push(item);
        }.bind(this));

        this.dataMain = this.data.workers = workers;
    }
};
