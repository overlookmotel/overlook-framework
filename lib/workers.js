// --------------------
// Overlook
// Workers
// --------------------

// modules
var util = require('util'),
    pathModule = require('path'),
    Promise = require('bluebird-extra'),
    requireFolderTree = require('require-folder-tree'),
    _ = require('overlook-utils');

// libraries
var api = require('./api'),
    OverlookError = require('./errors').OverlookError;

// exports

module.exports = {
    // load workers from worker directory
    init: function(overlook) {
        // load workers from workers dir
        var workers = requireFolderTree(overlook.options.paths.workers, {
            filterFiles: /^([^_].*)\.js(on)?$/,
            filterFolders: /^(([^_].*))$/,
            flatten: true
        });

        overlook.workers = {};

        _.forIn(workers, function(workerDef, workerName) {
            // create worker constructor
            var ThisWorker = function(options) {
                Worker.call(this, options);
            };
            util.inherits(ThisWorker, Worker);

            // create apiUrls
            var apiUrls = workerDef.apiUrls;
            if (!apiUrls) throw new OverlookError("No apiUrls provided for worker '" + workerName + "'");
            if (_.isString(apiUrls)) apiUrls = {base: apiUrls};

            ['start', 'current'].forEach(function(type) {
                _.defaultValue(apiUrls, type, pathModule.join(apiUrls.base, type));
            });

            _.defaultValue(apiUrls, 'progress', pathModule.join(apiUrls.base, ':jobId/progress'));

            ['done', 'failed'].forEach(function(type) {
                _.defaultValue(apiUrls, type, apiUrls.progress);
            });

            // save params to Worker
            _.extend(ThisWorker, {
                workerId: workerDef.id,
                workerName: workerName,
                apiUrls: apiUrls,
                autoStart: workerDef.autoStart || false
            });

            _.extend(ThisWorker.prototype, {
                Worker: ThisWorker,
                name: workerName,
                overlook: overlook
            });

            // create Job constructor
            var ThisJob = function(worker, options) {
                Job.call(this, worker, options);
            };
            util.inherits(ThisJob, Job);

            ThisJob.Worker = ThisJob.prototype.Worker = ThisWorker;
            ThisJob.prototype.Job = ThisJob;
            ThisJob.prototype.overlook = overlook;

            // save Job to Worker
            ThisWorker.Job = ThisWorker.prototype.Job = ThisJob;

            // save methods to Worker & Job prototypes
            if (workerDef.initWorker) ThisJob.prototype.init = workerDef.initWorker;
            if (workerDef.initJob) ThisJob.prototype.init = workerDef.initJob;

            ['startParams', 'run', 'onSuccess', 'onFail'].forEach(function(methodName) {
                if (workerDef[methodName]) ThisJob.prototype[methodName] = workerDef[methodName];
            });

            // get worker's config
            ThisWorker.options = overlook.options.workers[workerName];

            // create worker and save to overlook.workers
            overlook.workers[workerName] = new ThisWorker();
        });
    },

    // on startup, flags as failed all jobs master server believes to be currently processing
    // runs failed() function on each job
    startup: function(overlook) {
        return Promise.inSeries(overlook.workers, function(worker) {
            var currentJob = new worker.Job(worker);

            var apiParams = currentJob.startParams();
            apiParams.workerId = currentJob.Worker.workerId;

            return currentJob.apiHit('current', apiParams).bind(this)
            .tap(function(results) {
                if (!results) throw new OverlookError('Cannot connect to API server');
            })
            .each(function(jobParams) {
                // create job and populate with details from API
                var job = new worker.Job(worker);

                jobParams.jobId = _.pop(jobParams, 'id'); //xxx this is a hack - should be happening in API call not here
                _.extend(job, jobParams);

                // call failed method of job
                job.log('Killing');

                return job.failed(new Error('Server stopped while job running'));
            });
        });
    },

    autoStart: function(overlook) {
        console.log('Starting workers');

        _.forIn(overlook.workers, function(worker) {
            if (worker.Worker.autoStart) worker.start();
        });

        console.log('Started workers');
    },

    Worker: Worker,
    Job: Job
};

// Worker constructor
function Worker(options) {
    this.options = options || {};

    this.active = false;
    this.status = 'Stopped';
    this.jobs = {};

    this.log('Initializing');

    // run init function if defined
    if (this.init) this.init();
}

_.extend(Worker.prototype, {
    // start worker running
    // returns immediately
    start: function() {
        this.log('Starting');

        // set to active
        this.active = true;
        this.status = 'Started';

        // run a job
        if (Object.keys(this.jobs).length) return;

        runJob.call(this).bind(this)
        .then(function() {
            this.log('Stopped');
            this.status = 'Stopped';
        });
    },

    stop: function() {
        this.log('Stopping');

        // set to inactive
        this.active = false;
        this.status = Object.keys(this.jobs).length ? 'Stopping' : 'Stopped';
    },

    log: function(msg, obj) {
        if (obj !== undefined) msg += ': ' + JSON.stringify(obj);
        console.log(new Date() + ' Worker ' + this.name + ': ' + msg);
    }
});

// runs a job
// after completion, runs again
// returns when job completes and worker has been stopped
// returns Promise
function runJob() {
    // init new job
    var job = new this.Job(this);

    // run get method to get jobId
    return job.get().bind(this)
    .then(function(jobId) {
        if (!jobId) {
            // no jobs to run at present - schedule to run again
            if (!this.active) return;

            var interval = this.Worker.options.idleInterval;
            this.log('Scheduled to run again in ' + (interval / 1000) + ' seconds');

            return Promise.delay(interval).bind(this)
            .then(function() {
                return runAgain.call(this);
            });
        }

        // save to jobs collection
        this.jobs[jobId] = job;

        // run the job
        return job.start().bind(this)
        .then(function() {
            // delete job from jobs collection
            delete this.jobs[jobId];

            // run again
            return runAgain.call(this);
        })
        .return();
    });
}

function runAgain() {
    if (this.active) return runJob.call(this);
}

// Job constructor
function Job(worker, options) {
    this.options = options || {};

    this.worker = worker;

    this.progress = {
        received: 0,
        percent: 0
    };

    // run init function is defined
    if (this.init) this.init();
}

_.extend(Job.prototype, {
    // get details of job from API
    // returns Promise
    get: function() {
        this.log('Getting next job');

        // call startParams() method to get params
        var params = this.startParams();
        params = _.extend({
            workerId: this.Worker.workerId
        }, params);

        // hit API
        return this.apiHit('start', params).bind(this)
        .then(function(params) {
            // if null response, no more jobs of this type - return
            if (!params) {
                this.log('No jobs');
                return;
            }

            this.log('Assigned job ' + params.jobId);

            // copy all API params to this (includes jobId)
            _.extend(this, params);

            // return jobId
            return this.jobId;
        })
        .catch(function(err) {
            // error hitting API
            this.log('API error', err);
        });
    },

    start: function() {
        this.log('Starting');

        // run job
        return this.run().bind(this)
        .then(function(result) {
            // job succeeded
            this.log('Success', result);

            return this.success(result).bind(this)
            .return(true);
        })
        .catch(function(err) {
            // job failed
            this.log('Failed', err);

            // run cleanup and tell API failed
            return this.failed(err).bind(this)
            .return(false);
        });
    },

    progress: function(state) {
        // progress
        this.log('Progress ' + state.percent + '%');

        // update progress
        _.extend(this.progress, state);

        // inform API of progress
        return this.apiHit('progress', {
            status: 'Processing',
            progress: state.percent,
            statusData: JSON.stringify({progress: state})
        });
    },

    success: function(result) {
        return Promise.bind(this)
        .then(function() {
            // run cleanup
            if (this.onSuccess) {
                this.log('Cleaning up');
                return this.onSuccess(result).bind(this)
                .catch(function(err) {
                    this.log('Error cleaning up', err);
                });
            }
        })
        .then(function() {
            // hit API to say done
            _.defaults(result, {
                status: 'Done',
                progress: 100
            });
            if (result.statusData) result.statusData = JSON.stringify(result.statusData);

            return this.apiHit('done', result);
        });
    },

    failed: function(err) {
        // run cleanup
        return Promise.bind(this)
        .then(function() {
            // run cleanup
            if (this.onFail) {
                this.log('Cleaning up');
                return this.onFail(err).bind(this)
                .catch(function(err) {
                    this.log('Error cleaning up', err);
                });
            }
        })
        .then(function() {
            // hit API to say failed
            return this.apiHit('failed', {
                status: 'Failed',
                statusData: JSON.stringify({
                    error: {
                        name: err.name,
                        message: err.message,
                        stack: err.stack
                    }
                })
            });
        });
    },

    apiHit: function(eventType, params) {
        this.log('API call: ' + eventType);

        var url = this.Worker.apiUrls[eventType];
        if (this.jobId) url = url.replace(':jobId', this.jobId);

        return api.hit(url, params, this.overlook).bind(this)
        .catch(function(err) {
            this.log('API error', err);
        });
    },

    log: function(msg) {
        if (this.jobId) msg = 'Job ' + this.jobId + ': ' + msg;
        this.worker.log(msg);
    }
});
