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
