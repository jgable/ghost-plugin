/*global describe, it, beforeEach, afterEach*/
'use strict';

var path = require('path'),
    sinon = require('sinon'),
    when = require('when'),
    PostPlugin = require('../lib/PostPlugin');

describe('PostPlugin', function () {
    var sandbox,
        fakeTableCreate,
        fakeKnex,
        fakeMiddleware,
        fakeExpressStatic,
        fakeGhost,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeTableCreate = sandbox.stub().returns(function () {
                
        });

        fakeKnex = {
            Schema: {
                createTable: sandbox.stub().returns(function () {
                    return when.resolve();
                }),
                dropTableIfExists: sandbox.stub().returns(function () {
                    return when.resolve();
                })
            }
        };

        fakeGhost = {
            server: {
                get: sandbox.stub(),
                post: sandbox.stub(),
                'delete': sandbox.stub(),
                put: sandbox.stub(),
                use: sandbox.stub(),
                routes: {
                    get: [{
                        path: '/plugins/test/:param'
                    }, {
                        path: '/plugins/test-multi/:param'
                    }, {
                        path: '/some/other/route'
                    }],
                    post: [],
                    'delete': [],
                    put: []
                }
            },
            registerFilter: sandbox.stub(),
            unregisterFilter: sandbox.stub()
        };

        TestPlugin = PostPlugin.extend({
            routes: {
                get: {
                    '/plugins/test/:param': 'singleHandler',
                    '/plugins/test-multi/:param': ['nextHandler', 'singleHandler']
                },
                post: {
                    '/plugins/test': 'postHandler'
                },
                'delete': {
                    '/plugins/test/remove': 'removeHandler'
                },
                put: {
                    '/plugins/test/update': 'updateHandler'
                }
            },

            assets: {
                '/plugins/test/assets': path.join(__dirname, 'fixtures', 'assetPlugin', 'assets')
            },

            tables: {
                'posts_test': fakeTableCreate
            },

            filters: {
                'ghost_head': 'handleGhostHead',
                // Passes a priority
                'ghost_foot': [2, 'handleGhostFoot'],
                // Forgot to pass a priority
                'prePostRender': ['handlePostRender']
            },

            handleGhostHead: sandbox.stub(),
            handleGhostFoot: sandbox.stub(),
            handlePostRender: sandbox.stub()
        });

        // Fake the knex library
        TestPlugin.prototype.getKnex = sandbox.stub().returns(fakeKnex);

        // Fake the express middleware function
        fakeExpressStatic = sandbox.stub();
        fakeMiddleware = sandbox.stub().returns(fakeExpressStatic);
        TestPlugin.prototype.getExpressStaticMiddleware = sandbox.stub().returns(fakeMiddleware);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('does everything except make you breakfast', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.install().then(function () {
            // Created tables

            fakeKnex.Schema.createTable.callCount.should.equal(1);
            fakeKnex.Schema.createTable.calledWithExactly('posts_test', fakeTableCreate).should.equal(true);

            return plugin.activate();
        }).then(function () {
            // Registered routes, filters, assets

            fakeGhost.server.get.callCount.should.equal(2);
            fakeGhost.server.post.callCount.should.equal(1);
            fakeGhost.server['delete'].callCount.should.equal(1);
            fakeGhost.server.put.callCount.should.equal(1);
            
            fakeGhost.registerFilter.callCount.should.equal(3);
            
            fakeGhost.server.use.callCount.should.equal(1);
            fakeMiddleware.calledWithExactly(path.join(__dirname, 'fixtures', 'assetPlugin', 'assets')).should.equal(true);

            return plugin.deactivate();
        }).then(function () {
            // Unregistered routes, filters

            fakeGhost.server.routes.get.length.should.equal(1);

            fakeGhost.unregisterFilter.callCount.should.equal(3);

            return plugin.uninstall();
        }).then(function () {
            // Dropped tables

            fakeKnex.Schema.dropTableIfExists.callCount.should.equal(1);
            fakeKnex.Schema.dropTableIfExists.calledWithExactly('posts_test').should.equal(true);

            done();
        }).otherwise(function (err) {
            done(err);
        });
    });
});