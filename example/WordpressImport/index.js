'use strict';

var _ = require('lodash'),
    when = require('when'),
    nodefn = require('when/node/function'),
    xml2js = require('xml2js'),
    ImportPlugin = require('../../').ImportPlugin,
    WordpressImportPlugin;

/*
 * Things we are relying on being implemented
 * supportedImportTypes filter
 * import filter
 * importData:
 *  - getContents()
 * core/server/api/db.js
 *  - abstract importJSONData() from import to not rely on req/res.
 */

WordpressImportPlugin = ImportPlugin.extend({
    supportedTypes: [{
        name: 'Wordpress WXR'
    }],

    doImport: function (importData) {
        var self = this;

        return importData.getContents().then(function (fileContents) {
            // Parse the xml data
            return nodefn.call(xml2js.parseString, fileContents);
        }).then(function (parsedData) {
            // Convert to Ghost format
            try {
                if (!parsedData.rss || !parsedData.rss.channel) {
                    // This error is caught below and returned with when.reject()
                    throw new Error('Invalid format: No rss or channel elements found');
                }

                var items = parsedData.rss.channel[0].item,
                    posts = _.map(items, function (item) {
                        var post = self.getPostFieldsFromXml(item, {
                            'title': 'title',
                            'content:encoded': 'html',
                            'wp:post_date_gmt': 'published_at',
                            'wp:status': 'status'
                        });

                        // Massage the status a little
                        if (post.status === 'publish') {
                            post.status = 'published';
                        } else {
                            post.status = 'draft';
                        }

                        /*jshint camelcase: false */
                        // Update the published_at to a timestamp.
                        post.published_at = post.published_at || '';
                        post.published_at = new Date(post.published_at + '+00:00').getTime();
                        /*jshint camelcase: true */

                        return post;
                    });

                return {
                    meta: {
                        /*jshint camelcase: false */
                        // TODO: Get this from WXR file?
                        exported_on: new Date().getTime(),
                        /*jshint camelcase: true */
                        version: '000'
                    },
                    data: {
                        posts: posts
                    }
                };
            } catch (e) {
                return when.reject(e);
            }

            return when.resolve(parsedData);
        }).then(function (ghostImportFormatData) {
            // Inject into database or use import api

            return self.app.api.db.importJSONData(ghostImportFormatData);
        });
    },

    getPostFieldsFromXml: function (item, fieldMap) {
        var fields = _.keys(fieldMap),
            data = _.pick.apply(_, [item].concat(fields));

        // Fields all are arrays and need to be converted.
        return _.reduce(data, function (result, val, key) {
            var realVal = _.isArray(val) ? _.first(val) : val;

            result[fieldMap[key] || key] = realVal;

            return result;
        }, {});
    }
});

module.exports = WordpressImportPlugin;