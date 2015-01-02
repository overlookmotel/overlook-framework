// --------------------
// Overlook
// Routing
// --------------------

/*
route definition:

route = {
	name: <defined by name of folder>
	nameSingular: <routeName singular> (default: name of folder singularised)
	type: 'namespace' | 'resource' (default: 'namespace')

	parent: <defined as reference to parent route>
	parentType: 'namespace' | 'resource' (default: <parent's type> or 'namespace' for root)
	routes: <array of child routes>

	param: <name of param for parsing from url, which goes into req.params> (default: route name + 'Id')
	path: <defined by route path>
	itemPath: <defined by route path and param>

	title: <human-readable name of resource/namespace> (default: name humanised)
	titleItem: <human-readable name of item> (default: routeNameSingular humanised)

	view: <base dir of view> (default: <corresponding to directory path of route>)

	modelName: name of model to load by default (default: nameSingular capitalised)
	paramField: <string name of db field to compare to request param> (default: 'id')
	model: <model, defined by modelName>

	form: <form object, inherited by new and edit actions> (default: <based on fields in model>)

	actions: <object with indexes representing each action - see below>
}

action = {
	name: <defined by name of action>
	urlPart: action that appears in url (default: name, except for actions index and view where default is '')

	actionTypes: object with flags for what type of action it is
		- determines which action defaults are inherited
		- 'item' flag indicates whether this action acts on an item, rather than collection (default: false)
		- 'singular' flag indicates whether this action acts on a single item e.g. new item (default: false)

	path: <defined by route.path/route.itemPath, actiontypes.item and urlPart>

	title: <human-readable name of action> (default: name capitalised)

	view: <view file> (default: <corresponding to directory path of route & action>)

	load: <as above for route> (default: inherits route.load)

	form: <form object> (default: <inherit from route if action is new or edit>)

	get: function <method called on GET request>
	post: function <method called on POST request>
}
*/

// libraries
var loadControllers = require('./loadControllers'),
	applyDefaults = require('./applyDefaults'),
	initRoutes = require('./initRoutes');

// exports

module.exports = function(models, overlook, controllersPath, viewsPath) {
	// load all controller parameters from files
	console.log('Routes initialising');
	var routes = loadControllers(controllersPath);

	console.log('Routes loaded from files');

	// apply defaults
	applyDefaults(routes);

	console.log('Route defaults applied');

	// run init function on all routes
	return initRoutes(routes, viewsPath, models, overlook);
};
