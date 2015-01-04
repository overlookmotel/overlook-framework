// --------------------
// Group action buttons
// Initialises all group action buttons on page
// --------------------

(function() {
    $(document).ready(function() {
        $('a[data-group-submit]').each(function() {
            $(this).click(function() {
                var element = $(this);
                var url = element.attr('data-group-submit');
                element.closest('form').attr('action', url).submit();
            });
        });
    });
})();
