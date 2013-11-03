'use strict';

var _ = require('underscore'),
    Plugin = require('./Plugin'),
    AssetPlugin;

AssetPlugin = Plugin.extend({
    /** 
     * Example:
     * '/plugins/test/assets': path.join(__dirname, 'assets')
     */
    assets: null,

    activate: function () {
        this.registerAssets();
    },

    /**
     * Iterates through the assets and registers them as static directories
     */
    registerAssets: function (assets) {
        assets = assets || this.assets;

        if (_.isFunction(assets)) {
            assets = assets();
        }

        var self = this,
            expressStatic = this.getExpressStaticMiddleware();

        _.each(this.assets, function registerAssetPath(assetPath, route) {
            self.app.server.use(route, expressStatic(assetPath));
        });
    },

    getExpressStaticMiddleware: function () {
        return function undefinedExpressStaticMiddleware() {
            throw new Error('Must override the getExpressStaticMiddleware function in your Plugin in order to serve assets');
        };
    }
});

module.exports = AssetPlugin;