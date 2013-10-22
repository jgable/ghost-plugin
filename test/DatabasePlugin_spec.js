/*global describe, it, beforeEach, afterEach*/
'use strict';

var when = require('when'),
    sinon = require('sinon'),
    DatabasePlugin = require('../lib/DatabasePlugin');

describe('DatabasePlugin', function () {
    var sandbox,
        fakeGhost,
        fakeKnex,
        fakeTableCreate,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            server: {}
        };

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

        TestPlugin = DatabasePlugin.extend({
            tables: {
                'posts_test': fakeTableCreate
            }
        });

        // Fake the knex library
        TestPlugin.prototype.getKnex = sandbox.stub().returns(fakeKnex);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('registers tables', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.install().then(function () {

            fakeKnex.Schema.createTable.callCount.should.equal(1);
            fakeKnex.Schema.createTable.calledWithExactly('posts_test', fakeTableCreate).should.equal(true);

            done();
        }).otherwise(function (err) {
            done(err);
        });
    });

    it('drops tables', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.uninstall().then(function () {

            fakeKnex.Schema.dropTableIfExists.callCount.should.equal(1);
            fakeKnex.Schema.dropTableIfExists.calledWithExactly('posts_test').should.equal(true);

            done();
        }).otherwise(function () {
            throw new Error('Failed');
        });
    });
});