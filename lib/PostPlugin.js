'use strict';

var _ = require('lodash'),
    when = require('when'),
    Plugin = require('./Plugin'),
    RoutePlugin = require('./RoutePlugin'),
    AssetPlugin = require('./AssetPlugin'),
    FilterPlugin = require('./FilterPlugin'),
    DatabasePlugin = require('./DatabasePlugin'),
    Bases,
    PostPlugin;

when.sequence = require('when/sequence');

Bases = [
	RoutePlugin,
	AssetPlugin,
	FilterPlugin,
	DatabasePlugin
];

// TODO: Documentation and junk; I'm just surprised this hack worked so far.

PostPlugin = Plugin.extend({});

_.each(Bases, function (klass) {
	_.extend(PostPlugin.prototype, klass.prototype);
});

_.extend(PostPlugin.prototype, {
	// Must be provided by sub class
	express: null,
	knex: null,

	install: function () {
		return this._executePrototypeMethodInOrder(Bases, 'install', arguments);
	},

	activate: function () {
		return this._executePrototypeMethodInOrder(Bases, 'activate', arguments);
	},

	deactivate: function () {
		return this._executePrototypeMethodInOrder(Bases, 'deactivate', arguments);
	},

	uninstall: function () {
		return this._executePrototypeMethodInOrder(Bases, 'uninstall', arguments);
	},

	getExpressStaticMiddleware: function () {
		return this.express.static;
	},

	getKnex: function () {
		return this.knex;
	},

	_executePrototypeMethodInOrder: function (klasses, method, args) {
		var self = this,
			calls = _.map(klasses, function (klass) {
				return function () {
					return when(klass.prototype[method].apply(self, arguments));
				};
			});

		return when.sequence(calls, args);
	}
});

module.exports = PostPlugin;