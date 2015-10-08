// --------------------
// Dropdown typeaheads
// Initializes all dropdown typeaheads on page
// --------------------

(function() {
	$(document).ready(function() {
		typeaheadsInit();
		dropdownTypeaheadsInit();
	});

	// normal typeahead
	function typeaheadsInit()
	{
		// find all dropdown typeaheads
		$('input[data-typeahead-url]').each(function() {
			typeaheadInit($(this));
		});
	}

	function typeaheadInit(element)
	{
		// get field name
		var name = element.attr('name');

		// init bloodhound
		var bloodhound = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: element.attr('data-typeahead-url') + 'typeahead?c=' + encodeURIComponent(name) + '&q=%QUERY',
				filter: function(response) {
					return response.data.map(function(value) {return {value: value};});
				}
			}
		});

		bloodhound.initialize();

		// init typeahead
		element.typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: name,
			displayKey: 'value',
			source: bloodhound.ttAdapter()
		});
	}

	// dropdown typeaheads
	function dropdownTypeaheadsInit()
	{
		// find all dropdown typeaheads
		$('input[data-dropdown-url]').each(function() {
			dropdownTypeaheadInit($(this));
		});
	}

	function dropdownTypeaheadInit(element)
	{
		// init bloodhound
		var bloodhound = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: element.attr('data-dropdown-url') + 'list?q=%QUERY',
				filter: function(response) {
					var data = response.data;
					for (var i in data) {
						return data[i];
					}
				}
			}
		});

		bloodhound.initialize();

		// get dropdown name
		var name = element.attr('name').slice(0, -4);

		// get id form field and save in element
		element.data('idField', element.siblings(':input'));

		// set event handlers for state change
		element.bind({
			'typeahead:selected typeahead:autocompleted': dropdownTypeaheadSelected,
			'change': dropdownTypeaheadUnselected
		});

		// init typeahead
		element.typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: name,
			displayKey: 'name',
			source: bloodhound.ttAdapter()
		});
	}

	function dropdownTypeaheadSelected(event, selected)
	{
		$(this).data('idField').val(selected.id);
	}

	function dropdownTypeaheadUnselected()
	{
		$(this).data('idField').val('');
	}
})();
