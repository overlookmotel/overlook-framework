// --------------------
// Overlook
// Mailer
// --------------------

// modules
var mandrill = require('mandrill-api/mandrill'),
	Promise = require('bluebird-extra'),
	_ = require('overlook-utils');

// exports

// Mailer constructor
// when called with new Mailer(options), initializes Mandrill client
var Mailer = module.exports = function(options) {
	// save options to obj
	options = this.options = _.extend({
		async: true,
		message: {}
	}, options || {});
	
	if (options.from) {
		options.message.from = options.from;
		delete options.from;
	}
	
	// create mandrill client
	if (!options.apiKey) throw new Error('You must provide a Mandrill API key');
	
	this.client = new mandrill.Mandrill(options.apiKey);
};

_.extend(Mailer.prototype, {
	// sends a message
	// returns a Promise, resolved or rejected depending on whether sending succeeds
	send: function(message, options) {
		// parse options
		options = _.extend(this.options, options || {});
		
		// prepare message
		message = _.extend({}, options.message, message);
		
		if (_.isString(message.from)) message.from = {email: message.from};
		
		if (!Array.isArray(message.to)) message.to = [message.to];
		
		message.to.forEach(function(to) {
			if (!to.type) to.type = 'to';
		});
		
		// make all line returns \r\n
		message.text = message.text.replace(/\n/g, '\r\n').replace(/\r\r/g, '\r');
		
		// compile message in mandrill format
		message.from_email = message.from.email; // jshint ignore:line
		message.from_name = message.from.name; // jshint ignore:line
		delete message.from;
		
		// send message
		return new Promise(function(resolve, reject) {
			this.client.messages.send({message: message, async: options.async}, function(result) {
			    resolve(result);
			}, function(err) {
				reject(err);
			});
		}.bind(this));
	}
});
