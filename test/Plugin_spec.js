/*global describe, it*/
'use strict';

var _ = require('underscore'),
    Plugin = require('../lib/Plugin');

describe('Plugin', function () {
    it('has correct methods', function () {
        var plugin = new Plugin({}),
            methods = [
                'initialize',
                'install',
                'uninstall',
                'activate',
                'deactivate'
            ];
        
        _(methods).each(function (method) {
            _.isFunction(plugin[method]).should.equal(true);
        });
    });
});