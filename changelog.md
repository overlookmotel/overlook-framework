# Changelog

## 0.0.1

* Initial release

## 0.0.2

* Default sort order for users
* ejs-extra dependency

## 0.0.3

* Travis gets lastest Sequelize from Github

## 0.0.4

* Added url field format

## 0.0.5

* Added default view \_layouts/layoutInner.ejs

## 0.0.6

* Error messages

## 0.0.7

* User login field lengthened to 50 chars
* Long text fields edited in textboxes

## 0.0.8

* Refactor: move lib/routes/runRoute() into own file
* resourceJoin route type for showing many-to-many joins

## 0.0.9

* Code tidy

## 0.1.0

* ResourceJoin controllers and view implemented
* Unset Sequelize option `omitNull`
* Remove deprecated Sequelize option `syncOnAssociation`
* Bug fixes/typos

## 0.1.1

* Fixes for user set-up

## 0.1.2

* Login with email instead of user name

## 0.2.0

* Move users resource to inside admin namespace route (i.e. /admin/users)

## 0.2.1

* Move TODO into separate file, not included by npm
* Fix redirection after deleting resource item
* Dummy fields used in errors called '\_dummy' not 'dummy' to avoid clash with an actual field called 'dummy'
* Titles and messages for resourceJoin actions

## 0.2.2

* Handle error if attempt to create the same join twice in resource joins

## 0.2.3

* Expose `forms` library functions as `Overlook.forms`

## 0.2.4

* Change from `isRoot`, `isPublic` etc columns in user and role models to single column `type`
* Create 'admin' and 'user' roles
* Refactor db stocking code
* Controllers for permissions
* Edit user passwords on separate page
* Admin permission required to access admin namespace
* Split starting DB into separate function
* Remove travis need to load latest sequelize from Github - sequelize-extra now does this

## 0.2.5

* Add user role to all non-special users on startup

## 0.2.6

* Made edit buttons yellow, change password button light blue
* Buttons for users/roles/permission joins

## 0.2.7

* Support for ENUM datatype
* user.name field not unique
* Improved debug info printed to console.log on errors in startup and routes
* Record reference to overlook in all routes (so can be accessed by route init functions)
* Account namespace including function for user to update details and change password
* Markdown compilation support
* Contact link on login page

## 0.2.8

* Updated module dependency marked to v0.3.2

## 0.2.9

* Updated module dependency sequelize-extra to v0.2.8

## 0.2.10

* Add email-sending functionality, using Mandrill

## 0.2.11

* New users must initialize account before access granted
* textSpaced form field format - which preserves line spacing
* Code tidy

## 0.2.12

* Support for TIME model fields

## 0.2.13

* Form widgets for DATE and TIME fields

## 0.2.14

* Fix ENUM fields not making form menus

## 0.2.15

* Validate URLs
* Validate email addresses

## 0.2.16

* Fix bug where field properties not cloned and so erroneously affected by each other

## 0.2.17

* Admin controller to execute commands on database

## 0.2.18

* Remove admin controller to execute commands on database
* `authentication.makeHash()` method
* Added Server model + controllers
* HTTP authentication for servers
* Permissions and roles for access through API
* API for database actions

## 0.2.19

* API default action

## 0.2.20

* Updated module dependency overlook-utils to v0.0.5
* DateTime validation/conforming/displaying

## 0.2.21

* Fix DateTime conformer function

## 0.2.22

Accidental version bump. No changes.

## 0.2.23

* DateTime form widget

## 0.2.24

* API returns null value where no records
* Percent field format
* Simplify DateTime conformer regexp
* Update overlook-utils dependency to v0.0.6

## 0.2.25

* Fix account edit not using transaction
* Account password inherits act method direct from edit action (to avoid problems when overriden)
* Account init methods use defaultFn
* Refactor account init methods to simplify code
* Code tidy

## 0.2.26

* Boolean Yes/No radio boxes
* Expose form formats as Overlook.forms.formats

## 0.2.27

* Expose authentication library as Overlook.authentication
* authentication.makePassword() method

## 0.2.28

* Update sequelize-extra dependency to v0.2.9

## 0.2.29

* Remove ambiguous characters from passwords
* Base login email field on user email field
* Password reset functionality

## 0.2.30

* Populate form fields with default values
* Set default sessionCookieDuration to 1 hour
* Update TODO

## 0.2.31

Accidental version bump. No changes.

## 0.2.32

* Handle errors with generic error page in production mode

## 0.2.33

* Workers & processes
* Load loadReferences into data.references (to avoid clash when a model refers to itself and the loadReference was over-writing the main data as they were both being loaded into this.data[modelNamePlural])

## 0.2.34

* JSON field format

## 0.2.35

* API uses JSON field format

## 0.2.36

* Fix problem with bad links in index tables for nested resources

## 0.2.37

* Worker and Process models name unique
* asReverse defined for process.afterProcess association

## 0.2.38

* dataSize field format

## 0.2.39

* Remove duplicates from typeahead suggestions
* Add '.' to start of cookie domain
* Refactor cookies library

## 0.2.40

* intCollection field format

## 0.2.41

* API library
* HTTP library
* Workers library
* Expose API, HTTP and Workers libraries
* Add request module dependency
* Initialize workers on start up

## 0.2.42

* Update module dependency sequelize-extra to v0.2.10

## 0.2.43

No code changes, fixing typo in v num in last version

## 0.2.44

* Start autoStart workers on start-up
* Fix bugs in workers library
* Remove erroneous code in workers lib (not buggy)
* Make process model into a hierarchy
* Show virtual fields in tables etc except name
* Update sequelize-extra dependency to v0.2.12

## 0.2.45

* Repair typo in changelog for last version

## 0.2.46

* Workers startup API hit sends startParams
* Workers startup runs in series for easier debugging
* Workers startup stores API results in job obj
* Control panel for controlling workers
* Workers have status
* Fix bugs in workers library

## 0.2.47

* Display number of running jobs in localWorker/index
* Block access to unused actions in localWorker resource controller

## 0.2.48

* Log data sent to API
* Fix bug reporting number of worker jobs running

## 0.2.49

No code changes, fixing typo in v num in last version

## 0.2.50

* Workers get default options from \_default
* Worker#run passed progress options
* Fix bug progress fn clashing with progress state - progress fn renamed to `progressed`

## 0.2.51

* Fix bug in informing API of progress in workers

## 0.2.52

* api/insert returns id of inserted record

## 0.2.53

* api/select converts model names to models in query params

## 0.2.54

No changes. Erroneous version bump.

## 0.2.55

* Default worker options need not be provided
* `startParams` method optional for workers

## 0.2.56

* Workers log and send more details of errors to API

## 0.2.57

* Added `requiresResource` field to processes model

## 0.2.58

* Log worker errors

## 0.2.59

* Controllers+views for processes children of worker
* Updated module dependency overlook-utils to v0.0.7
* Removed all trailing whitespace

## 0.2.60

* Updated module dependency overlook-utils to v0.0.8

## 0.2.61

* Route action type `data`
* Add `isActive` field to process model
* Better error handling in workers
* Fix bug Job#log not passing obj to Worker#log
* Update sequelize-extra dependency to v0.2.13

## 0.2.62

* Split itemsTable view helper into 2 files
* Added actionsTable view helper
* Added modelLinkList view helper
* When action methods are inherited from default routes, parent action method is attached
* Allow non-array createForm+FieldsFromModel only/exclude options

## 0.2.63

* forms.createFormFromModel + forms.createFieldsFromModel `only` + `all` options override fields normally excluded

## 0.2.64

* Cookies get names from overlook.options

## 0.3.0

* Update sequelize-extra dependency to v0.4.1 (sequelize v3.2.0)
* Use CLS for Sequelize transactions
* Remove all transaction passing (now handled by CLS)
* Update dependencies
* Update dev dependencies
* Test code coverage & Travis sends to coveralls
* JSHint covers tests
* Disable Travis dependency cache
* Travis runs on new container infrastructure
* Update README badges to use shields.io

## 0.3.1

* Temporary fix for Sequelize losing CLS context on `Promise#nodeify()`

## 0.3.2

* Remove temporary fix for Sequelize losing CLS context on `Promise#nodeify()` (fixed in Sequelize v3.3.0)
* Update sequelize-extra dependency to v0.4.2 (sequelize v3.3.0)

## 0.3.3

* Update sequelize-extra dependency to v0.4.3

## 0.3.4

* Errors include stack trace

## 0.4.0

* Remove `localWorker` model + controller
* Remove servers, workers, processes

## 0.4.1

* `authentication.getUser` returns inactive users
* Expose crypto methods on Overlook
* Run Travis on node v0.12
* Changelog cleanup

## 0.4.2

* UUID request IDs
* Log request ID
* Print process user at startup
* Remove CLS context for static assets

## 0.4.3

* Move express middleware into route handler (to avoid CLS context bug)
* Code tidy

## 0.4.4

* Use Sequelize's Promise to avoid CLS context loss

## 0.4.5

* Update `overlook-utils` dependency

## 0.4.6

* Accept generators as route/action methods
* APIs return data without wrapping in results object

## 0.4.7

* Fix: errors on 404 not found pages

## 0.4.8

* Fix: correctly identify virtual fields and skip in forms

## 0.4.9

* Update dependencies
* Update dev dependencies
* `promisify-any` uses Sequelize Promise for CLS

## 0.4.10

* Update `express` dependency
* Update `sequelize-extra` dependency

## 0.4.11

* Fix: filters on ENUM fields
* Update `sequelize-extra` dependency

## 0.4.12

* Fix: correct identification of model field types
* Fix: filters on BOOLEAN fields

## 0.4.13

* Use `bunyan` for logging
* Convert `console.log` usage to bunyan logging
* Log request handling
* Log authentication events

## 0.4.14

* Notify Keymetrics of route errors
