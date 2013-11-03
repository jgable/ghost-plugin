'use strict';

var _ = require('underscore'),
    Plugin = require('./Plugin'),
    FilterPlugin;

FilterPlugin = Plugin.extend({
	/**
	 * Example
	 * 'ghost_head': [5, 'handleGhostHead'],
	 * 'ghost_foot': 'handleGhostFoot'
	 */
	filters: null,

	activate: function () {
		this.registerFilters();
	},

	deactivate: function () {
		this.unregisterFilters();
	},

	registerFilters: function (filters) {
		var self = this;
		this._eachFilter(filters, function (filterName, filterHandlerArgs) {
			var parms = [filterName].concat(filterHandlerArgs);

			self.app.registerFilter.apply(self.app, parms);
		});
	},

	unregisterFilters: function (filters) {
		var self = this;

		this._eachFilter(filters, function (filterName, filterHandlerArgs) {
			var parms = [filterName].concat(filterHandlerArgs);

			self.app.unregisterFilter.apply(self.app, parms);
		});
	},

	_eachFilter: function (filters, filterDataHandler) {
		filters = filters || this.filters;

		if (_.isFunction(filters)) {
			filters = filters();
		}

		var self = this;

		_.each(filters, function (filterHandlerArgs, filterName) {
			// Iterate through and determine if there is a priority or not
			if (_.isArray(filterHandlerArgs)) {
				// Account for some idiot only passing one value in the array.
				if (filterHandlerArgs.length === 1) {
					filterHandlerArgs.splice(0, 0, null);
				}

				filterHandlerArgs[1] = self[filterHandlerArgs[1]];
			} else {
				filterHandlerArgs = [null, self[filterHandlerArgs]];
			}

			filterDataHandler(filterName, filterHandlerArgs);
		});
	}
});

module.exports = FilterPlugin;