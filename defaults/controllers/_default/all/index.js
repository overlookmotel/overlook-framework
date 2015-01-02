// --------------------
// Default controller
// index action
// --------------------

// exports

// action definition
exports = module.exports = {
	// action params
	urlPart: '',
	titleAction: '',

	// functions

	makeBreadcrumbs: function() {
		this.breadcrumbs = this.makeBreadcrumbsIndex(this.route, this.data, this.url);
	}
};
