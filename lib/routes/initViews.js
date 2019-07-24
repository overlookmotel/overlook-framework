// --------------------
// Overlook
// Routing
// Function to init views
// --------------------

// modules
var _ = require('overlook-utils'),
	pathModule = require('path'),
	ejsLocals = require('ejs-extra');

// libraries
var Promise = require('../promise'),
	fs = require('../fs'),
	OverlookError = require('../errors').Error;

// promisify ejsLocals
ejsLocals = Promise.promisify(ejsLocals);

// define global vars
var viewsPath,
	overlook;

// exports

module.exports = function(routes, _overlook, _viewsPath) {
	// save viewsPath & overlook to top level scope
	overlook = _overlook;
	viewsPath = _viewsPath;

	// delete compiled views and re-make
	return fs.removeAsync(viewsPath + '/_compiled')
	.then(function() {
		overlook.log('Action views initializing');
		return initActionViews(routes);
	}).then(function() {
		overlook.log('Error views initializing');
		return initErrorViews();
	}).then(function() {
		overlook.log('Other views initializing');
		return initOtherViews();
	});
};

function initActionViews(route) {
	return Promise.try(function() {
		// init views for all actions
		if (route.actions) return Promise.in(route.actions, initView);
	}).then(function() {
		// iterate for children
		if (route.routes) return Promise.in(route.routes, initActionViews);
	});
}

function initView(action) {
	// if view set to false, no view - exit
	if (action.view === false) return;

	return findView(action)
	.then(function(view) {
		if (_.endsWith(view, '.build')) {
			// compile view from build file
			action.view = '_compiled' + action.routePath;
			return compileViewBuilder(action, view, action.routePath);
		} else {
			// no compilation - ejs file found
			action.view = view;
		}
	});
}

function findView(action) {
	// if view defined, check it exists
	//console.log('Searching for view for', action.routePath);

	if (action.view) {
		//console.log('View specified:', action.view);

		return checkViewExists(action.view, '')
		.then(function(found) {
			if (!found) throw new OverlookError('View \'' + action.view + '\' does not exist');
			return found;
		});
	}

	// view not defined - find default to use
	var actionName = action.name;
	var path = pathModule.join(action.routePath.slice(1), '../');
	if (path == './') path = '';

	return checkViewExists(path, actionName)
	.then(function(found) {
		if (found) return found;

		// direct view does not apply - check for default
		var filePath = '_default' + _.capitalize(action.route.type) + '/';

		return (function findView() {
			return checkViewExists(path + filePath, actionName)
			.then(function(found) {
				if (found) return found;

				if (path == '') throw new OverlookError('View cannot be found');

				path = pathModule.join(path, '../');
				if (path == './') path = '';
				return findView();
			});
		})();
	});
}

function checkViewExists(path, actionName) {
	// make list of potential files to use
	var potentials = [
		path + actionName,
		path + actionName + '.build'
	];

	if (actionName != '') {
		potentials.push(path + '_default');
		potentials.push(path + '_default.build');
	}

	// check if any of potentials exist
	return Promise.eachAny(potentials, function(path) {
		//console.log('Looking for view at', viewsPath + '/' + path + '.ejs');

		return fs.existsAsync(viewsPath + '/' + path + '.ejs')
		.then(function(exists) {
			if (exists) {
				//console.log('View found:', path);
				return path;
			}
		});
	});
}

function initErrorViews() {
	return initViewsFolder('errors');
}

function initOtherViews() {
	// compile layout for markdown docs
	return initViewsFolder('other');
}

function initViewsFolder(type) {
	var thisViewsPath = pathModule.join(viewsPath, '_' + type);

	return fs.readdirAsync(thisViewsPath)
	.each(function(fileName) {
		if (!_.endsWith(fileName, '.ejs')) return;

		return fs.isDirectoryAsync(pathModule.join(thisViewsPath, fileName))
		.then(function(isDirectory) {
			if (isDirectory) return;

			// compile error page
			if (_.endsWith(fileName, '.build.ejs')) {
				var view = '_' + type + '/' + fileName.slice(0, -10);
				return compileViewBuilder({view: '_compiled/' + view}, view + '.build', view);
			} else {
				return fs.copyAsync(pathModule.join(thisViewsPath, fileName), pathModule.join(viewsPath, '_compiled/_' + type, fileName));
			}
		});
	});
}

function compileViewBuilder(action, view, routePath) {
	var path = viewsPath + '/' + view + '.ejs';

	// compile build template
	var options = _.cloneAll(action);
	options.overlook = overlook;
	options.settings = {views: viewsPath};
	options._ = _;
	options.require = makeRequire(path);

	return ejsLocals(path, options)
	.catch(function(err) {
		// wrap error within new error containing route path
		var newErr = _.extend(
			new Error('View compilation error at route path ' + routePath + '\n' + err.message),
			{
				parent: err,
				name: err.name,
				path: err.path,
				routePath: routePath,
				stack: err.stack,
			}
		);

		throw newErr;
	})
	.then(function(h) {
		h = h.replace(/<\?/g, '<%').replace(/\?>/g, '%>').replace(/<%\?/g, '<?').replace(/\?%>/g, '?>');

		return fs.outputFileAsync(viewsPath + '/' + action.view + '.ejs', h);
	});
}

function makeRequire(fromPath) {
	return function(path) {
		// Convert relative path to absolute
		if (/^\.\.?/.test(path)) path = pathModule.join(fromPath, '..', path);

		return require(path);
	};
}
