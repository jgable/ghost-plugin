'use strict';

var _ = require('lodash'),
    when = require('when'),
    nodefn = require('when/node/function'),
    xml2js = require('xml2js'),
    ImportPlugin = require('../../').ImportPlugin,
    WordpressImportPlugin;

WordpressImportPlugin = ImportPlugin.extend({
    supportedTypes: [{
        name: 'Wordpress WXR'
    }],

    doImport: function (importData) {
        return importData.getContents().then(function (fileContents) {
            // Parse the xml data
            return nodefn.call(xml2js.parseString, fileContents).then(function (parsed) {
                return when.resolve(parsed);
            });
        }).then(function (parsedData) {
            // Convert to Ghost format
            try {
                if (!parsedData.rss || !parsedData.rss.channel) {
                    throw new Error('Invalid format: No rss or channel elements found');
                }

                var items = parsedData.rss.channel[0].item,
                    posts = _.map(items, function (item) {
                        // TODO: These all are arrays and need to be converted.
                        return _.pick(item, 'title', 'wp:post_date_gmt', 'wp:status');
                    });

                console.log(posts);
            } catch (e) {
                return when.reject(e);
            }

            return when.resolve(parsedData);
        }).then(function (ghostImportFormatData) {
            // Inject into database or use import api

            return when.resolve(ghostImportFormatData);
        }).then(function (importedData) {
            return when.resolve({
                users: importedData.users,
                posts: importedData.posts,
                tags: importedData.tags
            });
        });
    }
});

module.exports = WordpressImportPlugin;