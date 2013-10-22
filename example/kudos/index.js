'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    when = require('when'),
    GhostPlugins = require('ghost-plugin'),
    PostPlugin = GhostPlugins.PostPlugin,
    KudosPlugin;

KudosPlugin = PostPlugin.extend({
    express: require('express'),
    knex: require('bookshelf').ghost.Knex,

    tables: {
        'posts_kudos': function createPostsKudosTable(t) {
            t.integer('post_id')
             .primary();

            t.integer('kudos').defaultTo(0);
        }
    },

    assets: {
        '/plugins/kudos/assets': path.join(__dirname, 'assets')
    },

    routes: {
        post: {
            '/plugins/kudos/api/': 'handleKudosPost'
        }
    },

    filters: {
        'ghost_head': 'addCSSReference',
        'ghost_foot': 'addScriptReference',
        'prePostsRender': 'addKudosToPost'
    },

    initialize: function () {
        _.bindAll(this, 'addKudosToPost', 'handleKudosPost');

        var templateContents = fs.readFileSync(path.join(__dirname, 'kudos.tpl')).toString();

        this.htmlTemplate = _.template(templateContents);
    },

    handleKudosPost: function (req, res) {
        // TODO: Request throttling or something?
        var postId = req.param('postId', 0);

        if (!postId) {
            return res.send(404, 'Post Not Found with id ' + postId);
        }

        this.incrementPostKudos(postId).then(function () {
            res.json({ success: true });
        }, function (e) {
            res.json({ error: e.message });
        });
    },

    incrementPostKudos: function (postId) {
        return this.getKnex()('posts_kudos').increment('kudos', 1)
            .where('post_id', postId);
    },

    addKudosToPost: function (post) {
        if (_.isArray(post)) {
            // Don't do anything on the list view, just for single posts
            return post;
        }

        return this.addKudosContent(post);
    },

    addCSSReference: function (styles) {
        styles.push('<link rel="stylesheet" type="text/css" href="/plugins/kudos/assets/kudos.css">');

        return styles;
    },

    addScriptReference: function (scripts) {
        // TODO: Check existing scripts for underscore/backbone already loaded
        // TODO: The underscore and backbone additions could just be there own plugins
        scripts.push('<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>');
        scripts.push('<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"></script>');
        scripts.push('<script src="/plugins/kudos/assets/kudos.js"></script>');

        return scripts;
    },

    /*jshint camelcase:false*/
    addKudosContent: function (post) {
        
        var self = this;

        // Add Kudo count from database
        return this.getKnex()('posts_kudos').select('kudos').where({
            post_id: post.id
        }).then(function (kudosVal) {
            // Default to 0
            var kudosCount = kudosVal && kudosVal.length > 0 ? kudosVal[0].kudos : 0;

            // Add the kudo figure html
            post.html += self.htmlTemplate({
                kudos: kudosCount
            });

            // Add the post id to the Kudo object
            // TODO: This should be made available by Ghost somewhere on the page
            post.html += '\n<script>window.Kudo = window.Kudo || {}; window.Kudo.postId = ' + post.id + ';</script>';

            if (kudosVal.length < 1) {
                // Add the default kudos row
                return this.getKnex()('posts_kudos').insert({
                    post_id: post.id,
                    kudos: 0
                }).then(function () {
                    return when.resolve(post);
                });
            }

            return when.resolve(post);
            
        }).otherwise(function (e) {
            console.log('Problem loading post kudos', e);
        });
    }
    /*jshint camelcase:true*/
});

module.exports = KudosPlugin;