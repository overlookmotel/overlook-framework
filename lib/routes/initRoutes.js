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
	routeTypes = ['namespace', 'resource'];

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
	
	// set up parentType
	if (!parent) {
		if (route.parentType !== undefined && route.parentType != 'namespace') throw new errors.OverlookError('Root parentType cannot be set as anything but namespace in ' + route.sourcePath);
		route.parentType = 'namespace';
	} else if (route.parentType === undefined) {
		route.parentType = parent.type;
	} else if (routeTypes.indexOf(route.parentType) == -1) {
		throw new errors.OverlookError('Route parentType "' + route.parentType + '" is invalid in ' + route.sourcePath);
	} else if (route.parentType == 'resource' && parent.type != 'resource') {
		throw new errors.OverlookError('Route parentType cannot be set as resource when parent is not a resource in ' + route.sourcePath);
	}
	
	// set up urlPart
	_.defaultValue(route, 'urlPart', route.name.toLowerCase());
	
	// set up route paths
	if (route.path || route.routePath) throw new errors.OverlookError('Route paths cannot be defined manually (in ' + route.sourcePath + ')');
	
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
	_.forEach(['itemPath', 'model'], function(illegal) {
		if (route[illegal] !== undefined) throw new errors.OverlookError('Route ' + illegal + ' cannot be defined manually (in ' + route.sourcePath + ')');
	});
	
	if (route.type == 'resource') {
		// set param, itemPath, model details
		_.defaults(route, {
			param: route.nameSingular + 'Id',
			paramField: 'id', //xxx would be better if got from model primary key
			modelName: route.nameSingular
		});
		
		route.itemPath = route.path + ':' + route.param + '/';
		route.model = models[route.modelName];
		
		// record modelPath
		modelPaths[route.modelName] = route.path; //xxx need way to only get one model path (if model used in different places)
	} else {
		// give error if resource-related parameters are defined on a route which is not a resource
		_.forEach(['param', 'modelName', 'paramField'], function(illegal) {
			if (route[illegal] !== undefined) throw new errors.OverlookError('Routes which are not resources should not have ' + illegal + ' defined (in ' + route.sourcePath + ')');
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
