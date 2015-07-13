// --------------------
// Overlook
// Mailer
// --------------------

// modules
var mandrill = require('mandrill-api/mandrill'),
	_ = require('overlook-utils');

// libraries
var Promise = require('./promise');

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

		// add additional bcc if defined in options
		if (options.bcc) {
			var bcc = options.bcc;
			if (_.isString(bcc)) bcc = {email: bcc};
			bcc.type = 'bcc';

			message.to.push(bcc);
		}

		// make all line returns \r\n
		message.text = message.text.replace(/\n/g, '\r\n').replace(/\r\r/g, '\r');

		// compile message in mandrill format
		message.from_email = message.from.email; // jshint ignore:line
		message.from_name = message.from.name; // jshint ignore:line
		delete message.from;

		console.log('Sending email:', message);

		// send message
		return new Promise(function(resolve, reject) {
			this.client.messages.send({message: message, async: options.async}, function(result) {
			    resolve(result);
			}, function(err) {
				reject(err);
			});
		}.bind(this));
	},

	sendBatch: function(message, recipients, options) {
		// parse recipients
		if (!Array.isArray(recipients)) recipients = [recipients];

		// loop through recipients, sending mail to each
		return Promise.bind(this)
		.return(recipients)
		.each(function(recipient) {
			// replace placeholders in text
			var text = message.text;

			_.forIn(recipient, function(value, key) {
				text = text.replace('[' + key + ']', value);
			});

			// compile message obj
			var thisMessage = _.clone(message);
			thisMessage.text = text;
			thisMessage.to = {
				name: recipient.name,
				email: recipient.email
			};

			// send message
			return this.send(thisMessage, options);
		});
	}
});
