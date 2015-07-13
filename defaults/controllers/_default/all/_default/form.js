// --------------------
// Default controller
// Default form action
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var Promise = require('../../../../../lib/promise'),
	forms = require('../../../../../lib/forms');

// exports

// action definition
exports = module.exports = {
	// functions

	// init form before running rest of init
	init: function(defaultFn) {
		// init form
		return Promise.bind(this)
		.then(this.initForm)
		.then(defaultFn);
	},

	get: function() {
		// run chain of functions
		return Promise.bind(this)
		.then(this.start)
		.then(this.load)
		.then(this.makeTitle)
		.then(this.makeBreadcrumbs)
		.then(this.access)
		.ifElse(function() {
			return Promise.bind(this)
			.then(this.loaded)
			.ifElse(function() {
				return Promise.bind(this)
				.then(this.populate)
				.then(this.loadAdditional)
				.then(this.display);
			}, function() {
				return Promise.bind(this)
				.then(this.loadFail);
			});
		}, function() {
			return Promise.bind(this)
			.then(this.accessFail);
		});

		/*
		//xxx delete this
		this.chain([
			this.start,
			this.load,
			this.makeTitle,
			this.makeBreadcrumbs,
			{
				test: this.access,
				success: {
					test: this.loaded,
					success: [
						this.populate,
						this.loadAdditional,
						this.display
					],
					fail: this.loadFail
				},
				fail: this.accessFail
			}
		], callback);
		*/
	},

	post: function() {
		// run chain of functions
		return Promise.bind(this)
		.then(this.start)
		.then(this.load)
		.then(this.makeTitle)
		.then(this.makeBreadcrumbs)
		.then(this.access)
		.ifElse(function() {
			return Promise.bind(this)
			.then(this.loaded)
			.ifElse(function() {
				return Promise.bind(this)
				.then(this.repopulate)
				.then(this.sanitise)
				.then(this.validate)
				.ifElse(function() {
					return Promise.bind(this)
					.then(this.conform)
					.then(this.process)
					.then(this.act)
					.ifElse(function() {
						return Promise.bind(this)
						.then(this.commit)
						.then(this.done);
					}, function() {
						return Promise.bind(this)
						.then(this.rollback)
						.then(this.failed)
						.then(this.loadAdditional)
						.then(this.display);
					});
				}, function() {
					return Promise.bind(this)
					.then(this.rollback)
					.then(this.loadAdditional)
					.then(this.display);
				});
			}, function() {
				return Promise.bind(this)
				.then(this.rollback)
				.then(this.loadFail);
			});
		}, function() {
			return Promise.bind(this)
			.then(this.rollback)
			.then(this.accessFail);
		});

		/*
		//xxx delete this
		this.chain([
			this.start,
			this.load,
			this.makeTitle,
			this.makeBreadcrumbs,
			{
				test: this.access,
				success: {
					test: this.loaded,
					success: [
						this.repopulate,
						this.sanitise,
						{
							test: this.validate,
							success: [
								this.conform,
								this.process,
								{
									test: this.act,
									success: [
										this.commit,
										this.done,
									],
									fail: [
										this.rollback,
										this.failed,
										this.loadAdditional,
										this.display
									]
								}
							],
							fail: [
								this.rollback,
								this.loadAdditional,
								this.display
							]
						}
					],
					fail: [
						this.rollback,
						this.loadFail
					]
				},
				fail: [
					this.rollback,
					this.accessFail
				]
			}
		], callback);
		*/
	},

	populate: function() {
		// populate form data with default values
		this.formData = forms.populateDefaults(this.form);
		this.formErrors = {};
	},

	repopulate: function() {
		// populate form data from request post
		this.formData = forms.populateFromPost(this.form, this.req.body);
		this.formErrors = {};
	},

	process: function() {},

	makeDisplayOptions: function(defaultFn) {
		return defaultFn().bind(this)
		.then(function() {
			this.displayOptions.options.formData = this.formData;
			this.displayOptions.options.formErrors = this.formErrors;

			var viewData = this.displayOptions.options.data = {};
			if (this.loadReferences) {
				viewData.references = {};
				_.forEach(this.loadReferences, function(model) {
					viewData.references[model.namePlural] = forms.getValuesByFields(this.data.references[model.namePlural], {id: {}, name: {}});
				}, this);
			}
		});
	},

	sanitise: function() {
		forms.sanitise(this.form, this.formData);
	},
	validate: function() {
		return forms.validate(this.form, this.formData, this.formErrors);
	},
	conform: function() {
		this.actData = forms.conform(this.form, this.formData);
	}
};
