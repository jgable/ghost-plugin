'use strict';

var _ = require('lodash'),
    when = require('when'),
    Plugin = require('./Plugin'),
    DatabasePlugin;

DatabasePlugin = Plugin.extend({
    /**
     * Example
     * 'posts_kudos': function (table) { table.integer('post_id').primary(); table.integer('kudos').defaultTo(0); }
     */
    tables: null,

    install: function () {
        return this.registerTables();
    },

    uninstall: function () {
        return this.dropTables();
    },

    registerTables: function (tables) {
        tables = tables || this.tables;

        if (_.isFunction(tables)) {
            tables = tables();
        }

        if (!tables) {
            return when.resolve();
        }

        var knex = this.getKnex(),
            tableCreations = _.map(this.tables, function (tableCreateHandler, tableName) {
                return knex.Schema.createTable(tableName, tableCreateHandler);
            });

        return when.all(tableCreations);
    },

    dropTables: function (tables) {
        tables = tables || this.tables;

        if (_.isFunction(tables)) {
            tables = tables();
        }

        if (!tables) {
            return when.resolve();
        }

        var knex = this.getKnex(),
            tableDrops = _.map(this.tables, function (tableCreateHandler, tableName) {
                return knex.Schema.dropTableIfExists(tableName);
            });

        return when.all(tableDrops);
    },

    getKnex: function () {
        throw new Error('Must implement getKnex() in your plugin in order to create or drop tables');
    }
});

module.exports = DatabasePlugin;