/*global describe, it, beforeEach, afterEach*/
'use strict';

var sinon = require('sinon'),
    //when = require('when'),
    ImportPlugin = require('../lib/ImportPlugin');

describe('ImportPlugin', function () {
    var sandbox,
        fakeGhost,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            registerFilter: sandbox.stub(),
            unregisterFilter: sandbox.stub()
        };

        TestPlugin = ImportPlugin.extend({
            supportedTypes: [{
                name: 'Wordpress WRX'
            }]
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('registers for supportedTypes and import filters', function () {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        fakeGhost.registerFilter.callCount.should.equal(2);
    });

    it('can detect supported types', function () {
        var plugin = new TestPlugin(fakeGhost),
            importData = {
                type: 'Wordpress WRX'
            };

        plugin.checkIfImportable(importData).should.equal(true);

        importData.type = 'Subtext';

        plugin.checkIfImportable(importData).should.equal(false);
    });

    it('will fail import by default', function (done) {
        var plugin = new TestPlugin(fakeGhost),
            importData = {
                type: 'Wordpress WRX'
            };

        plugin.doImport(importData).then(function () {
            done(new Error('Should not doImport'));
        }).otherwise(function (err) {
            err.message.should.equal('Must implement doImport in your ImportPlugin');

            done();
        });
    });

});