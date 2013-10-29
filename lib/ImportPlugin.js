'use strict';

var _ = require('lodash'),
	when = require('when'),
    FilterPlugin = require('./FilterPlugin'),
    ImportPlugin;

// The base class for Import Plugins
ImportPlugin = FilterPlugin.extend({
	filters: {
		'supportedImportTypes': 'addImportTypes',
		'import': 'handleImportFilter'
	},

	/*
	 * Example
	 * [{
	 *    name: "Wordpress WXR"
	 * }]
	 */
	supportedTypes: null,

	addImportTypes: function (importTypes) {
		// Add all the supportedTypes to the array passed to the filter
		_.each(this.supportedTypes, importTypes.push);
	},

	handleImportFilter: function (importData) {
		// Check if the data is importable by this plugin
		if (this.checkIfImportable(importData)) {
			// Do the import if so.
			return this.doImport(importData);
		}

		// Otherwise, just resolve to continue.
		return when.resolve();
	},

	checkIfImportable: function (importData) {
		// Look for a matching supported type
		return _.any(this.supportedTypes, function (supportedType) {
			return importData.type === supportedType.name;
		});
	},

	doImport: function () {
		return when.reject(new Error('Must implement doImport in your ImportPlugin'));
	}
});

module.exports = ImportPlugin;