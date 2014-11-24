// --------------------
// Overlook
// Routing
// Function to init routes
// --------------------

// modules
var _ = require('overlook-utils'),
	Promise = require('bluebird-extra');

// libraries
var createRoute = require('./createRoute'),
	initViews = require('./initViews'),
	errors = require('../errors');

// define global vars
var overlook,
	models,
	modelPaths = {},
	routeTypes = ['namespace', 'resource', 'resourceJoin', 'root'];

// exports

module.exports = function(routes, viewsPath, _models, _overlook) {
	// exit if no routes
	if (!routes) return;
	
	// save models & overlook to top level scope
	overlook = _overlook;
	models = _models;
	
	// init routes
	return initRoute(routes, null).then(function() {
		console.log('Routes initialised');
		
		// save modelPaths to overlook
		overlook.modelPaths = modelPaths;
		
		// init views
		console.log('Views initialising');
		return initViews(routes, overlook, viewsPath).then(function() {
			console.log('Views initialised');
		});
	});
};

// functions

function initRoute(route, parent) {
	// record parent in route
	if (parent) route.parent = parent;
	
	// check route type and parentType are valid
	if (!route.type) throw new OverlookError('Route type not defined in ' + route.sourcePath);
	if (routeTypes.indexOf(route.type) == -1) throw new OverlookError("Route type '" + route.type + "' is invalid in " + route.sourcePath);
	
	if (parent) {
		if (route.type == 'root') throw new OverlookError("route.type cannot be 'root' except at root of the controller tree in " + route.sourcePath);
		
		if (parent.type == 'resource') {
			// parent is a resource
			if (route.parentType === undefined) {
				route.parentType = parent.type;
			} else if (routeTypes.indexOf(route.parentType) == -1) {
				throw new OverlookError("Route parentType '" + route.parentType + "' is invalid in " + route.sourcePath);
			} else if (route.type == 'resourceJoin' && route.parentType != 'resource') {
				throw new OverlookError("Route parentType must be 'resource' for resource joins in " + route.sourcePath);
			}
		} else if (parent.type == 'resourceJoin') {
			throw new OverlookError("Routes of type 'resourceJoin' cannot have child routes in " + route.sourcePath);
		} else {
			// parent is root or a namespace
			if (route.parentType === undefined) {
				route.parentType = 'namespace';
			} else if (route.parentType != 'namespace') {
				throw new OverlookError("parentType cannot be set as anything but 'namespace' in " + route.sourcePath);
			} else if (route.type == 'resourceJoin') {
				throw new OverlookError("route.type cannot be 'resourceJoin' if not a child route of a resource in " + route.sourcePath);
			}
		}
	} else {
		if (route.type !== undefined && route.type !== 'root') throw new OverlookError("route.type must be 'root' at root of the controller tree in " + route.sourcePath);
		route.type = 'root';
	}
	
	// check for route attributes that cannot be manually defined
	_.forEach(['model', 'targetModel', 'path', 'routePath', 'itemPath'], function(illegal) {
		if (route[illegal] !== undefined) throw new OverlookError('Route ' + illegal + ' cannot be defined manually in ' + route.sourcePath);
	});
	
	// set up urlPart
	_.defaultValue(route, 'urlPart', route.name.toLowerCase());
	
	// set up route paths
	if (!parent) {
		route.path = '/';
		route.routePath = '/';
	} else {
		route.path = (route.parentType == 'resource' ? parent.itemPath : parent.path) + route.urlPart + '/';
		route.routePath = parent.routePath + route.name + '/';
	}
	
	// set up route name singular
	_.defaultValue(route, 'nameSingular', _.singularize(route.name));
	
	// set up param, itemPath, model details
	if (route.type == 'resource' || route.type == 'resourceJoin') {
		// set param, itemPath details
		_.defaults(route, {
			param: route.nameSingular + 'Id',
			paramField: 'id' //xxx would be better if got from model primary key
		});
		
		route.itemPath = route.path + ':' + route.param + '/';
		
		// set model
		if (!route.modelName) {
			if (route.parentType != 'resource') {
				route.modelName = route.nameSingular;
				if (route.as) throw new OverlookError('Route as cannot be defined if not a nested resource in ' + route.sourcePath);
			} else {
				// find association to this model
				_.defaultValue(route, 'as', route.name);
				
				var association;
				_.forIn(parent.model.associations, function(thisAssociation) {
					if (thisAssociation.associationType == 'HasMany' && thisAssociation.as == route.as) {
						association = thisAssociation;
						return false;
					}
				});
				
				if (!association) throw new OverlookError("Association '" + parent.modelName + '.' + route.as + "' is not defined in " + route.sourcePath);
				
				if (route.type == 'resourceJoin') {
					route.modelName = association.throughModel.name;
					route.targetModel = association.target;
					console.log('target:', route.targetModel);
				} else {
					route.modelName = association.target.name;
				}
			}
		} else if (route.parentType == 'resource' && !route.as) {
			route.as = route.name;
		}
		
		route.model = models[route.modelName];
		if (!route.model) throw new OverlookError("Model '" + modelName + "' is not defined in " + route.sourcePath);
		
		// record modelPath
		if (route.type == 'resource') modelPaths[route.modelName] = route.path; //xxx need way to only get one model path (if model used in different places)
	} else {
		// give error if resource-related parameters are defined on a route which is not a resource or resourceJoin
		_.forEach(['param', 'paramField', 'modelName'], function(illegal) {
			if (route[illegal] !== undefined) throw new errors.OverlookError('Routes which are not resource/resourceJoin should not have ' + illegal + ' defined in ' + route.sourcePath);
		});
	}
	
	// run route's init function
	return Promise.try(function() {
		if (route.init) return route.init();
	}).then(function() {
		// init route actions
		return initRouteActions(route);
	}).then(function() {
		// create routing for actions (not item actions)
		createRouteActions(route, false);
	}).then(function() {
		// init child routes
		if (!route.routes) return;
		
		return Promise.forIn(route.routes, function(childRoute) {
			return initRoute(childRoute, route);
		});
	}).then(function() {
		// create routing for actions (item actions)
		createRouteActions(route, true);
	});
}

// init actions
function initRouteActions(route) {
	// set up actions
	return Promise.forIn(route.actions, function(action, actionName) {
		// set route, routePath, actionTypes & urlPart
		action.route = route;
		action.routePath = route.routePath + actionName;
		_.defaults(action, {
			actionTypes: {},
			urlPart: actionName.toLowerCase()
		});
		
		// get path
		action.path = (action.actionTypes.item ? route.itemPath : route.path) + action.urlPart;
		
		// run init function if defined
		return Promise.try(function() {
			if (action.init) return action.init();
		});
	}).then(function() {
		// sort actions
		_.sort(route.actions, function(a, b) {
			return a.value.urlPart > b.value.urlPart;
		});
	});
}

// create routing for actions
function createRouteActions(route, isItem) {
	// set up routes
	_.forIn(route.actions, function(action) {
		if (!action.actionTypes.item == isItem) return; // jshint ignore:line
		
		if (action.get) createRoute('get', action, overlook);
		if (action.post) createRoute('post', action, overlook);

		console.log('Route initialised:', action.path);
	});
}
