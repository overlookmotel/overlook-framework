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

## Next

* Made edit buttons yellow, change password button light blue
* Buttons for users/roles/permission joins
