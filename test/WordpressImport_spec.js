/*global describe, it, beforeEach, afterEach*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    when = require('when'),
    should = require('should'),
    WordpressImport = require('../example/WordpressImport'),
    wxrPath = path.join(__dirname, '..', 'example', 'WordpressImport', 'example.wxr');

describe('WordpressImport', function () {
    var sandbox,
        fakeGhost,
        fakeImportData,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            registerFilter: sandbox.stub(),
            unregisterFilter: sandbox.stub()
        };

        fakeImportData = {
            getContents: function () {
                var contents = fs.readFileSync(wxrPath).toString();

                return when.resolve(contents);
            }
        };

        TestPlugin = WordpressImport.extend({});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('can import Wordpress WXR', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        plugin.doImport(fakeImportData).then(function (result) {
            should.exist(result);

            done();
        }, done);
    });
});