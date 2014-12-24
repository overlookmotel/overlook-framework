// --------------------
// Overlook
// API calling
// --------------------

// modules
var _ = require('overlook-utils');

// libraries
var http = require('./http');

// exports

var api = module.exports = {
    hit: function(url, form, overlook) {
        return http.fetch(overlook.options.apiServerUrl + url, {
            auth: {
                user: 'server:' + overlook.options.serverId,
                pass: overlook.options.serverPassword
            },
            form: form,
            headers: {
                'Accept': 'application/json'
            }
        })
        .spread(function(response, body) { // jshint ignore:line
            var result = JSON.parse(body);

            if (result.formErrors) throw new Error('API error: ' + _.values(_.mapValues(result.formErrors, function(msg, fieldName) {return fieldName + ': ' + msg;})).join(', '));

            if (result.redirect) return true;
            return result.data.results;
        })
        .catch(function(err) {
            console.log('ERROR: API error: ' + err.message);
            return;
        });
    },

    hitApi: function(action, model, data, overlook) {
        var form = {
            model: model
        };

        _.forIn(data, function(value, key) {
            form[key] = JSON.stringify(value);
        });

        return api.hit('api/' + action, form, overlook);
    }
};
