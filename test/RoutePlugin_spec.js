/*global describe, it, beforeEach, afterEach*/
'use strict';

var //_ = require('lodash'),
    sinon = require('sinon'),
    RoutePlugin = require('../lib/RoutePlugin');

describe('RoutePlugin', function () {
    var sandbox,
        fakeGhost,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            server: {
                get: sandbox.stub(),
                post: sandbox.stub(),
                'delete': sandbox.stub(),
                put: sandbox.stub(),
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
            }
        };

        TestPlugin = RoutePlugin.extend({
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

            singleHandler: function () { return; },

            nextHandler: function () { return; },

            postHandler: function () { return; },

            removeHandler: function () { return; },

            updateHandler: function () { return; }
        });

    });

    afterEach(function () {
        sandbox.restore();
    });

    it('registers routes', function () {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        fakeGhost.server.get.callCount.should.equal(2);
        fakeGhost.server.get.calledWithExactly('/plugins/test/:param', plugin.singleHandler).should.equal(true, 'called with single string');
        fakeGhost.server.get.calledWithExactly('/plugins/test-multi/:param', plugin.nextHandler, plugin.singleHandler).should.equal(true, 'called with array in order');

        fakeGhost.server.post.callCount.should.equal(1);
        fakeGhost.server.post.calledWithExactly('/plugins/test', plugin.postHandler).should.equal(true);

        fakeGhost.server['delete'].callCount.should.equal(1);
        fakeGhost.server.delete.calledWithExactly('/plugins/test/remove', plugin.removeHandler).should.equal(true);

        fakeGhost.server.put.callCount.should.equal(1);
        fakeGhost.server.put.calledWithExactly('/plugins/test/update', plugin.updateHandler).should.equal(true);
    });

    it('unregisters routes', function () {
        var plugin = new TestPlugin(fakeGhost);

        fakeGhost.server.routes.get.length.should.equal(3);

        plugin.deactivate();

        fakeGhost.server.routes.get.length.should.equal(1);
    });
});