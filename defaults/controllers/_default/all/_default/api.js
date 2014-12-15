// --------------------
// Default controller
// Default api action
// --------------------

// exports

exports = module.exports = {
	access: function() {
		// allow access if API user
		return !!this.user.permissions.API;
	},
	
	done: function() {
		// if no data to return, redirect
		if (this.dataMain === undefined) return this.redirect('./', 'Action completed');
		
		// display results
		var displayOptions = {
			options: {
				data: {
					results: this.dataMain
				}
			},
			layoutOptions: {
				title: this.title,
				breadcrumbs: this.breadcrumbs,
				url: this.url,
				user: this.user
			}
		};
		
		// render page (just show menu if HTML call)
		this.view = '_compiled/api/index';
		return this.render(displayOptions.options, displayOptions.layoutOptions);
	},
	
	failed: function() {
		var error = this.actResult.error,
			field = this.actResult.field;
		
		if (error == 'illegalValue') {
			this.formErrors[field] = this.form.fields[field].label + ' is invalid';
			return;
		}
		if (error == 'uniqueFail') {
			this.formErrors[field] = 'Unique constraint violated';
			return;
		}
		if (error == 'cannotDelete') {
			this.formErrors[field] = 'Cannot be deleted';
			return;
		}
		
		throw new Error('Unknown error returned from act function');
	}
};
