// --------------------
// Items table
// Initialises all item tables on page
// --------------------

$(document).ready(function() {
	// find all item table filter bars
	$('tr[data-item-table-filters] td :input:last-child').each(function() {
		initInput($(this));
	});
	
	function initInput(element)
	{
		//alert(element.attr('name'));
		
		element.bind('change', filterChanged);
		
		if (element.attr('data-typeahead-url') !== undefined) {
			element.bind('typeahead:selected typeahead:autocompleted', filterChanged);
		} else if (element.attr('data-dropdown-url')) {
			element.bind({
				'typeahead:selected typeahead:autocompleted': dropdownTypeaheadSelected,
				'change': dropdownTypeaheadUnselected
			});
		}
	}
	
	function dropdownTypeaheadSelected(event, selected)
	{
		$(this).data('idField').val(selected.id);
		reload($(this));
	}

	function dropdownTypeaheadUnselected()
	{
		$(this).data('idField').val('');
		reload($(this));
	}
	
	function filterChanged()
	{
		reload($(this));
	}
	
	function reload(input)
	{
		// create query string from filters
		var queryParts = [];
		var inputs = input.parents('tr[data-item-table-filters]').find('td :input');
		inputs.each(function() {
			var input = $(this);
			var name = input.attr('name');
			if (!name) return;
			
			var val = input.val();
			if (!val) return;
			
			// skip name fields for open menus where id is selected
			if (input.attr('data-dropdown-url') && input.data('idField').val()) return;
			
			name = name.slice(0, 1).toUpperCase() + name.slice(1);
			queryParts.push('f' + escape(name) + '=' + escape(val));
		});
		
		// add sort to query string
		var sortMatch = window.location.search.match(/(?:^\?|\&)(s=[^\&]+)(?:$|\&)/);
		if (sortMatch) queryParts.push(sortMatch[1]);
		
		var query = queryParts.length ? '?' + queryParts.join('&') : './';
		
		window.location = query;
	}
});
