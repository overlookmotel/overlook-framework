// --------------------
// Overlook
// Forms
// Data formats
// --------------------

// exports

exports = module.exports = {
	// string types
	string: {
		widget: 'typeahead',
		filterWidget: 'typeahead',
		mainType: 'string',
		sanitise: {
			standard: true
		}
	},
	text: {
		widget: 'textbox',
		filterWidget: 'text',
		mainType: 'text',
		sanitise: {
			textbox: true
		},
		display: {
			textbox: true
		}
	},
	textSpaced: {
		widget: 'textbox',
		filterWidget: 'text',
		mainType: 'text',
		sanitise: {
			textboxSpaced: true
		},
		display: {
			textbox: true
		}
	},
	password: {
		widget: 'password',
		mainType: 'string',
		// NB password does not inherit from string as input is not sanitised
		display: {
			password: true
		}
	},
	
	// number types
	int: {
		format: 'string',
		widget: 'text',
		filterWidget: 'text',
		mainType: 'number',
		validate: {
			int: true
		},
		conform: {
			number: true
		},
		populate: {
			number: true
		},
		displayers: {
			number: true
		}
	},
	intPos: {
		format: 'int',
		validate: {
			int: false,
			intPos: true
		}
	},
	
	decimal: {
		format: 'string',
		widget: 'text',
		filterWidget: 'text',
		mainType: 'number',
		validate: {
			decimal: true
		},
		conform: {
			decimal: true
		},
		populate: {
			decimal: true
		},
		display: {
			decimal: true
		}
	},
	currency: {
		format: 'decimal',
		widget: 'currency',
		filterWidget: 'text',
		mainType: 'number',
		display: {
			currency: true
		}
	},
	
	// boolean type
	boolean: {
		widget: 'checkbox',
		filterWidget: 'checkboxFilter',
		mainType: 'boolean',
		sanitise: {
			boolean: true
		},
		conform: {
			boolean: true
		},
		populate: {
			boolean: true
		},
		display: {
			boolean: true
		},
		default: '0'
	},
	
	// date/time types
	date: {
		format: 'string',
		widget: 'text',
		filterWidget: 'text',
		mainType: 'date',
		validate: {
			date: true
		},
		conform: {
			date: true
		},
		populate: {
			date: true
		},
		display: {
			date: true
		}
	},
	time: {
		format: 'string',
		widget: 'text',
		filterWidget: 'text',
		mainType: 'date',
		validate: {
			time: true
		},
		conform: {
			time: true
		},
		populate: {
			time: true
		},
		display: {
			time: true
		}
	},
	dateTime: {
		format: 'string',
		widget: 'text',
		filterWidget: 'text',
		mainType: 'date',
		validate: {
			dateTime: true
		},
		conform: {
			dateTime: true
		},
		populate: {
			dateTime: true
		},
		display: {
			dateTime: true
		}
	},
	
	// enum
	enum: {
		format: 'string',
		widget: 'enum',
		filterWidget: 'enum',
		validate: {
			enum: true
		}
	},
	
	// misc types
	email: {
		format: 'string',
		validate: {
			email: true
		},
		conform: {
			email: true
		},
		display: {
			email: true
		}
	},
	url: {
		format: 'string',
		validate: {
			url: true
		},
		conform: {
			url: true
		},
		display: {
			url: true
		}
	},
	
	// menu types
	idMenu: {
		format: 'intPos',
		widget: 'menu',
		filterWidget: 'menu'
	},
	idMenuOpen: {
		format: 'intPos',
		widget: 'menuOpen',
		filterWidget: 'menuOpen',
		validate: {
			menuOpen: true,
			intPos: false
		},
		requiredOverride: true
	}
};
