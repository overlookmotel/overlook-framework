# Copy frontend components from npm modules to:
#   defaults/public/css/overlook/css/
#   defaults/public/js/overlook/libraries/

echo "Installing packages from npm"
npm install

echo "Installing frontend components"

# bootstrap
cp node_modules/bootstrap/dist/js/bootstrap.min.js defaults/public/js/overlook/libraries/
cp node_modules/bootstrap/dist/css/bootstrap.min.css defaults/public/css/overlook/css/
cp node_modules/bootstrap/dist/css/bootstrap-theme.min.css defaults/public/css/overlook/css/

# jquery (dependency of bootstrap)
cp node_modules/jquery/dist/jquery.min.js defaults/public/js/overlook/libraries/

# html5shiv (dependency of bootstrap)
cp node_modules/html5shiv/dist/html5shiv.min.js defaults/public/js/overlook/libraries/

# respond.js (dependency of bootstrap)
cp node_modules/respond.js/dest/respond.min.js defaults/public/js/overlook/libraries/

# bootstrap-datetimepicker
cp node_modules/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js defaults/public/js/overlook/libraries/
cp node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css defaults/public/css/overlook/css/

# moment (dependency of bootstrap-datetimepicker)
cp node_modules/moment/min/moment.min.js defaults/public/js/overlook/libraries/

# typeahead
cp node_modules/typeahead.js/dist/typeahead.bundle.min.js defaults/public/js/overlook/libraries/

# typeahead.js-bootstrap3.less (to make typeahead fit with bootstrap styles)
cp node_modules/typeahead.js-bootstrap3.less/typeahead.css defaults/public/css/overlook/css/

# finished
echo "Done"
