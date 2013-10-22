/*global describe, it, beforeEach, afterEach*/
'use strict';

var path = require('path'),
    sinon = require('sinon'),
    AssetPlugin = require('../lib/AssetPlugin');

describe('AssetPlugin', function () {
    var sandbox,
        fakeGhost,
        fakeMiddleware,
        fakeExpressStatic,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            server: {
                use: sandbox.stub()
            }
        };

        TestPlugin = AssetPlugin.extend({
            assets: {
                '/plugins/test/assets': path.join(__dirname, 'fixtures', 'assetPlugin', 'assets')
            }
        });

        // Fake the express middleware function
        fakeExpressStatic = sandbox.stub();
        fakeMiddleware = sandbox.stub().returns(fakeExpressStatic);
        TestPlugin.prototype.getExpressStaticMiddleware = sandbox.stub().returns(fakeMiddleware);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('registers assets', function () {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        fakeGhost.server.use.callCount.should.equal(1);
        fakeGhost.server.use.calledWithExactly('/plugins/test/assets', fakeExpressStatic).should.equal(true, 'called with route and express static handler');
        fakeMiddleware.calledWithExactly(path.join(__dirname, 'fixtures', 'assetPlugin', 'assets')).should.equal(true);
    });
});