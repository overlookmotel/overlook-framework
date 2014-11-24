// --------------------
// Overlook
// Routing
// Function to load controllers from files
// --------------------

// modules
var _ = require('overlook-utils'),
	requireFolderTree = require('require-folder-tree');

// libraries
var errors = require('../errors');

// define constants
var routeTypes = ['namespace', 'resource', 'resourceJoin', 'root'];

// exports
module.exports = function(controllersPath) {
	// load controllers files
	var routes = requireFolderTree(controllersPath, {
		indexFile: '_index.js',
		foldersKey: 'routes',
		filesKey: 'actions',
		filterFiles: /^([^_].*)\.js(on)?$/,
		filterFolders: /^(_default|([^_].*))$/
	});
	
	// parse routes
	parseRoute(routes, [], false);
	routes.name = '';
	
	// return routes
	return routes;
};

function parseRoute(route, routePath, isDefault) {
	// check route type set
	if (isDefault) {
		if (route.type !== undefined) throw new errors.OverlookError("Default routes should not have type defined (in '" + routePath.join('.') + "')");
	} else {
		if (route.type === undefined) {
			// undefined route type
			throw new errors.OverlookError("Route '" + routePath.join('.') + "' has no type defined");
		} else if (routeTypes.indexOf(route.type) == -1) {
			// invalid route type
			throw new errors.OverlookError("Route '" + routePath.join('.') + "' has invalid type");
		}
	}
	
	// check all actions are valid and set action name on actions
	_.forIn(route.actions, function(action, actionName) {
		// throw error if illegal type of action
		if (action !== false && !_.isPlainObject(action)) throw new errors.OverlookError("Route action '" + routePath.join('.') + '.' + actionName + "' is not valid");
		
		// check actionTypes defined
		_.defaultValue(action, 'actionTypes', {});
		
		// save action name
		action.name = actionName;
	});
	
	// move defaults to defaultRoutes and defaultActions
	if (route.routes && route.routes._default) {
		// move default actions
		if (!_.isEmpty(route.routes._default.actions)) {
			route.defaultActions = route.routes._default.actions;
			
			// check default actions do not have action types defined
			_.forIn(route.defaultActions, function(action, actionName) {
				if (action.actionTypes) throw new errors.OverlookError("Action types should not be defined in default actions in '" + routePath.join('.') + '.' + actionName + "'");
			});
		}
		
		// move default routes + parse recursively
		if (route.routes._default.routes) {
			route.defaultRoutes = route.routes._default.routes;
			
			_.forIn(route.defaultRoutes, function(thisRoute, thisRouteName) {
				parseRoute(thisRoute, routePath.concat(['_default', thisRouteName]), true);
			});
		}
		
		// delete _default
		delete route.routes._default;
		if (_.isEmpty(route.routes)) delete route.routes;
	}
	
	// set source path for route
	route.sourcePath = routePath.join('.');
	
	// parse child routes recursively
	if (route.routes) {
		_.forIn(route.routes, function(thisRoute, thisRouteName) {
			parseRoute(thisRoute, routePath.concat([thisRouteName]));
			thisRoute.name = thisRouteName;
		});
	}
}
