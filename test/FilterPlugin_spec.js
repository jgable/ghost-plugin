/*global describe, it, beforeEach, afterEach*/
'use strict';

var sinon = require('sinon'),
    FilterPlugin = require('../lib/FilterPlugin');

describe('FilterPlugin', function () {
    var sandbox,
        fakeGhost,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            registerFilter: sandbox.stub(),
            unregisterFilter: sandbox.stub()
        };

        TestPlugin = FilterPlugin.extend({
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
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('registers filters', function () {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        fakeGhost.registerFilter.callCount.should.equal(3);
        fakeGhost.registerFilter.calledWithExactly('ghost_head', null, plugin.handleGhostHead).should.equal(true);
        fakeGhost.registerFilter.calledWithExactly('ghost_foot', 2, plugin.handleGhostFoot).should.equal(true);
        fakeGhost.registerFilter.calledWithExactly('prePostRender', null, plugin.handlePostRender).should.equal(true);
    });

    it('unregisters filters', function () {
        var plugin = new TestPlugin(fakeGhost);

        plugin.deactivate();

        fakeGhost.unregisterFilter.callCount.should.equal(3);
        fakeGhost.unregisterFilter.calledWithExactly('ghost_head', null, plugin.handleGhostHead).should.equal(true);
        fakeGhost.unregisterFilter.calledWithExactly('ghost_foot', 2, plugin.handleGhostFoot).should.equal(true);
        fakeGhost.unregisterFilter.calledWithExactly('prePostRender', null, plugin.handlePostRender).should.equal(true);
    });
});