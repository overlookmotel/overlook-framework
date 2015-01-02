// --------------------
// Overlook
// Routing
// Function to apply defaults to routes & actions
// --------------------

// modules
var Promise = require('bluebird-extra'),
	_ = require('overlook-utils');

// define global vars
var routeTypes = ['namespace', 'resource', 'resourceJoin', 'root'];

// exports

module.exports = function(routes) {
	// if no routes, exit
	if (!routes) return;

	// apply defaults to routes
	applyDefaults(routes);
};

// functions

function applyDefaults(route, parent) {
	// inherit from 'all' default route into other default routes
	var defaultRoutes = route.defaultRoutes;

	if (defaultRoutes) {
		defaultRouteInherit('all', defaultRoutes);

		_.forEach(routeTypes, function(routeType) {
			defaultRouteInherit(routeType, defaultRoutes, defaultRoutes.all);
		});

		delete defaultRoutes.all;
	}

	// inherit default routes from parent's default routes
	if (parent && parent.defaultRoutes) {
		if (defaultRoutes) {
			_.forEach(routeTypes, function(routeType) {
				defaultRouteInherit(routeType, defaultRoutes, parent.defaultRoutes[routeType]);
			});
		} else {
			defaultRoutes = route.defaultRoutes = parent.defaultRoutes;
		}
	}

	// inherit route from default route
	normalRouteInherit(route);

	// iterate for child routes
	if (route.routes) {
		_.forIn(route.routes, function(childRoute) {
			applyDefaults(childRoute, route);
		});
	}
}

function defaultRouteInherit(routeType, defaultRoutes, fromDefaultRoute) {
	if (defaultRoutes[routeType]) {
		routeInherit(defaultRoutes[routeType], fromDefaultRoute);
		actionsInheritDefault(defaultRoutes[routeType], fromDefaultRoute);
		childrenInheritDefault(defaultRoutes[routeType], fromDefaultRoute);
	} else if (fromDefaultRoute) {
		defaultRoutes[routeType] = fromDefaultRoute;
	}
}

function normalRouteInherit(route) {
	// inherit route from default route
	var defaultRoute;
	if (route.defaultRoutes) defaultRoute = route.defaultRoutes[route.type];

	routeInherit(route, defaultRoute);
	actionsInherit(route, defaultRoute);
	childrenInherit(route, defaultRoute);
}

function routeInherit(route, defaultRoute) {
	// inherit basic route parameters
	_.inheritPrototype(route, defaultRoute);

	// combine functions where in both route and defaultRoute
	if (defaultRoute) {
		_.forOwn(route, function(param, paramName) {
			if (param && _.isFunction(param) && defaultRoute[paramName] !== undefined) route[paramName] = combineFunctions(param, defaultRoute[paramName]);
		});
	}

	// default actions inherit from default route's default actions
	if (route.hasOwnProperty('defaultActions')) {
		if (defaultRoute && defaultRoute.defaultActionsInherited) {
			route.defaultActionsInherited = _.clone(route.defaultActions);
			_.setPrototype(route.defaultActionsInherited, defaultRoute.defaultActionsInherited);

			_.forOwn(route.defaultActionsInherited, function(action, actionName) {
				if (!action) return;
				if (!defaultRoute.defaultActionsInherited[actionName]) return;

				action = route.defaultActionsInherited[actionName] = _.clone(action);
				_.inheritPrototype(action, defaultRoute.defaultActionsInherited[actionName]);
			});
		} else {
			route.defaultActionsInherited = route.defaultActions;
		}
	}
}

// called when inheriting from one default to another
function actionsInheritDefault(route, defaultRoute) {
	// if no actions and no actions in default route, exit
	if (!route.actions) return;

	// if no actions defined in route - apply action defaults to default route's actions
	if (!route.hasOwnProperty('actions')) {
		if (!route.defaultActions) {
			// no actions defined and no default actions to apply - set actions = default route's actions
			if (defaultRoute.actions) route.actions = defaultRoute.actions;
			return;
		}

		// route has no actions but default route does have actions
		// apply default actions to default route's actions
		var actions = _.setPrototype({}, defaultRoute.actions);

		var defaultActionsUsed = false;
		_.forIn(actions, function(action, actionName) {
			if (!action) return;

			var applicableDefaultActions = getApplicableDefaultActions(action.actionTypes, route.defaultActions);
			if (!applicableDefaultActions) return;

			action = actions[actionName] = _.setPrototype({}, action);

			applyApplicableDefaultActions(action, applicableDefaultActions);

			defaultActionsUsed = true;
		});

		if (defaultActionsUsed) route.actions = actions;

		return;
	}

	// inherit actions from default route
	if (defaultRoute) _.inheritPrototype(route.actions, defaultRoute.actions);

	// combine actions from route with actions from default route
	actionsInheritWhereActions(route, defaultRoute);
}

function actionsInheritWhereActions(route, defaultRoute) {
	// actions defined in route
	// for each action from route, apply default actions then default route's action
	// for each action from default route, apply default actions to default route's action
	var actions = route.actions;

	_.forIn(actions, function(action, actionName) {
		if (!action) return;

		var applicableDefaultActions;
		if (actions.hasOwnProperty(actionName)) {
			// action comes from route

			if (defaultRoute && defaultRoute.actions && defaultRoute.actions[actionName]) {
				// also action in default route

				// inherit action from default route
				var defaultRouteAction = defaultRoute.actions[actionName];
				_.inheritPrototype(action, defaultRouteAction);

				// combine actionTypes from route and default route
				if (action.hasOwnProperty('actionTypes')) _.inheritPrototype(action.actionTypes, defaultRoute.actions[actionName].actionTypes);

				// apply action defaults
				applicableDefaultActions = getApplicableDefaultActions(action.actionTypes, route.defaultActions);
				applyApplicableDefaultActions(action, applicableDefaultActions);

				// combine functions from default route action
				_.forIn(defaultRouteAction, function(func, funcName) {
					if (action.hasOwnProperty(funcName) && action[funcName] && _.isFunction(action[funcName])) action[funcName] = combineFunctions(action[funcName], func);
				});
			} else {
				// no action in defaultRoute

				// apply action defaults
				applicableDefaultActions = getApplicableDefaultActions(action.actionTypes, route.defaultActionsInherited);

				if (applicableDefaultActions && applicableDefaultActions.length == 1) {
					_.setPrototype(action, applicableDefaultActions[0]);

					// combine functions where in both action and default action
					_.forOwn(action, function(func, funcName) {
						if (func && _.isFunction(func) && applicableDefaultActions[0][funcName]) action[funcName] = combineFunctions(func, applicableDefaultActions[0][funcName]);
					});
				} else {
					applyApplicableDefaultActions(action, applicableDefaultActions);
				}
			}
		} else {
			// action comes from default route - apply action defaults
			action = actions[actionName] = _.setPrototype({}, action);

			// apply action defaults
			applicableDefaultActions = getApplicableDefaultActions(action.actionTypes, route.defaultActions);
			applyApplicableDefaultActions(action, applicableDefaultActions);
		}
	});
}

// called when inheriting from default to route
function actionsInherit(route, defaultRoute) {
	// if no actions defined in route, set up empty actions
	if (!route.hasOwnProperty('actions')) route.actions = {};

	// apply actions from default route
	if (defaultRoute && defaultRoute.actions) {
		_.forIn(defaultRoute.actions, function(action, actionName) { // jshint ignore:line
			if (!route.actions[actionName]) route.actions[actionName] = {};
		});
	}

	// inherit from default actions and default route's actions
	return actionsInheritWhereActions(route, defaultRoute);
}

function childrenInheritDefault(route, defaultRoute) {
	// if children not in route, exit
	if (!route.hasOwnProperty('routes')) return;

	// inherit defaults for each child
	/*
	//xxx delete this?
	_.forIn(route.routes, function(childRoute) {
		//applyDefaults(childRoute, route);
	});
	*/

	// if children not in defaultRoute, exit
	if (!defaultRoute || !defaultRoute.routes) return;

	// inherit children from defaultRoute
	_.setPrototype(route.routes, defaultRoute.routes);

	// merge each child that is in both route and defaultRoute
	_.forOwn(route.routes, function(childRoute, childRouteName) {
		if (!defaultRoute.routes[childRouteName]) return;

		//xxx write this
		childRoute = childRoute;
	});
}

function childrenInherit(route, defaultRoute) {
	// if children not in route, exit (already inherited any child routes from defaultRoute)
	if (!route.hasOwnProperty('routes')) return;

	// if children not in defaultRoute, exit
	if (!defaultRoute || !defaultRoute.routes) return;

	// inherit children from defaultRoute
	_.setPrototype(route.routes, defaultRoute.routes);

	// merge each child that is in both route and defaultRoute
	_.forOwn(route.routes, function(childRoute, childRouteName) {
		if (!defaultRoute.routes[childRouteName]) return;

		//xxx write this
		childRoute = childRoute;
	});
}

function getApplicableDefaultActions(actionTypes, defaultActions) {
	if (!defaultActions) return;

	var actions = [];

	if (actionTypes) {
		_.forIn(actionTypes, function(flag, actionType) {
			if (!flag) return;
			if (defaultActions[actionType]) actions.push(defaultActions[actionType]);
		});
	}

	if (defaultActions.all) actions.push(defaultActions.all);

	if (!actions.length) return;
	return actions;
}

function applyApplicableDefaultActions(action, defaultActions) {
	if (!defaultActions) return;

	_.forEach(defaultActions, function(defaultAction) {
		_.forIn(defaultAction, function(func, funcName) {
			if (action[funcName]) {
				if (_.isFunction(action[funcName])) action[funcName] = combineFunctions(action[funcName], func);
			} else if (!action.hasOwnProperty(funcName)) {
				action[funcName] = func;
			}
		});
	});
}

function combineFunctions(fn, defaultFn) {
	defaultFn = Promise.method(defaultFn);

	return function(defaultFn2) {
		var self = this;
		return fn.call(this, function() {
			return defaultFn.call(self, defaultFn2);
		});
	};
}
