// --------------------
// Overlook
// HTTP fetching
// --------------------
// modules
var request = require('request'),
    Promise = require('bluebird-extra'),
    _ = require('overlook-utils');

// exports

var http = module.exports = {
    // fetches a page
    // returns Promise resolving to [response, body]
    // if options.progress provided, calls options.progress.fn on progress
    fetch: function(url, options) {
        options = options || {};
        return fetch(url, options);
    },

    // fetches a page and check if it redirects
    // returns the final url (i.e. if multiple redirections, it follows them all)
    checkRedirect: function(url, options) {
        // parse options
        options = _.extend({
            followRedirect: false
        }, options || {});

        return fetch(url, options)
        .spread(function(response, body) { // jshint ignore:line
            if (response.statusCode != 302) return url;

            var newUrl = response.headers.location;
            if (newUrl == url) throw new Error('Redirection loop at ' + url);

            return http.checkRedirect(newUrl);
        });
    }
};

function fetch(url, options) {
    return new Promise(function(resolve, reject) {
        options = _.extend({
            method: (options.form ? 'post' : 'get')
        }, options);

        request(url, options, function(err, response, body) {
            if (err) return reject(err);
            resolve([response, body]);
        });
    });
}
