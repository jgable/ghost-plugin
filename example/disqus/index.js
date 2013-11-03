'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    GhostPlugins = require('ghost-plugin'),
    PostPlugin = GhostPlugins.PostPlugin,
    DisqusPlugin;

DisqusPlugin = PostPlugin.extend({
    filters: {
        'prePostsRender': 'addDisqusToPost'
    },

    initialize: function () {
        _.bindAll(this, 'addDisqusToPost');

        // Create a template of the footer content
        var templateContents = fs.readFileSync(path.join(__dirname, 'disqus-post.tpl')).toString();
        this.postFooterTemplate = _.template(templateContents);
    },

    addDisqusToPost: function (post) {
        if (_.isArray(post)) {
            // Don't add to listing
            return post;
        }

        post.html += this.postFooterTemplate({
            // TODO: Load this from ghost instance or something
            shortname: 'Change Me',
            post: post
        });

        return post;
    }
});

module.exports = DisqusPlugin;