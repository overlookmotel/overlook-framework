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

* Added default view _layouts/layoutInner.ejs

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
* Dummy fields used in errors called '_dummy' not 'dummy' to avoid clash with an actual field called 'dummy'
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

## Next

* dataSize field format
