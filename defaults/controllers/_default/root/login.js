// --------------------
// Root namespace controller
// login action
// --------------------

// libraries
var forms = require('../../../../lib/forms'),
	authentication = require('../../../../lib/authentication'),
	cookies = require('../../../../lib/cookies');

// exports

// action definition
exports = module.exports = {
	// action params
	actionTypes: {
		form: true
	},
	
	title: 'Login',
	actLocal: true,
	
	// functions
	
	initForm: function() {
		// make form
		this.form = forms.createFormFromModel(this.route.overlook.models.user, {only: ['email']});
		this.form.fields.email.widget = 'text';
		
		forms.addField(this.form, 'password', {format: 'password', required: true});
		forms.addField(this.form, 'remember', {format: 'boolean', label: 'Remember me'});
		
		this.form.submit = {
			text: 'Login',
			noCancel: true
		};
	},
	
	access: function() {
		return true;
	},
	
	act: function() {
		// check login details against db
		return authentication.login(this.actData.email, this.actData.password, this.actData.remember, this.res, this.overlook).bind(this)
		.then(function(user) {
			if (!user) {
				// success
				this.actResult = {error: 'loginFailed'};
				return false;
			}
			
			// success
			this.user = user;
			return true;
		});
	},
	
	done: function() {
		// check for postLogin cookie and get url from it
		var url = '/';
		var cookie = cookies.getCookie('postLogin', this.req, this.res, this.overlook);
		if (cookie) {
			// if cookie for this user, get redirection url from cookie
			var keep = false;
			if (cookie.i == this.user.id) {
				url = cookie.u;
				if (cookie.b) keep = true;
			}
			
			// clear cookie if does not have body element
			if (!keep) cookies.clearCookie('postLogin', this.res, this.overlook);
		}
		
		// redirect
		return this.redirect(url, 'Logged in as ' + this.user.name);
	},
	
	failed: function() {
		var error = this.actResult.error;
		if (error == 'loginFailed') {
			this.formErrors.email = 'Login failed. Please try again.';
			this.formData.password = '';
			return;
		}
		
		throw new Error('Unknown error returned from act function');
	}
};
