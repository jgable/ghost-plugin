'use strict';

var _ = require('lodash'),
    Plugin = require('./Plugin'),
    RoutePlugin;

/**
 * The base class for plugins that need to register routes.
 * @class
 * @parameter {Ghost} The current Ghost app instance
 */
RoutePlugin = Plugin.extend({
    /**
     * holds a mapping of http methods and routes to be registered on the app.server.
     * @object
     */
    routes: {
        get: {
            /* Examples
            'some/route/:param1': 'handleSomeRoute'
            'some/route/:param1': ['checkAuth', 'handleSomeRoute', 'renderSomethingElse']
             */
        },
        post: {},
        'delete': {},
        put: {}
    },

    activate: function () {
        this.registerRoutes();
    },

    deactivate: function () {
        // TODO: Remove routes; http://stackoverflow.com/questions/10378690/remove-route-mappings-in-nodejs-express
        this.unregisterRoutes();
    },

    /**
     * Iterates through the routes provided, or the routes on this instance and registers them with the ghost server.
     */
    registerRoutes: function (routes) {
        var self = this;

        this._eachRoute(routes, function (httpMethod, route, handlers) {
            // Create the parameters array to apply to the http method function on the app.server.
            var params = [route].concat(handlers);

            // e.g. self.app.server.get('some/route/:param1', self.handleSomeRoute)
            self.app.server[httpMethod].apply(self.app, params);
        });
    },

    unregisterRoutes: function (routes) {
        var self = this;

        this._eachRoute(routes, function (httpMethod, route) {
            var serverRoutes = self.app.server.routes[httpMethod],
                foundRouteIndex;

            _.each(serverRoutes, function (serverRoute, i) {
                if (serverRoute.path === route) {
                    foundRouteIndex = i;
                    // Not sure this does anything in a _.each
                    return false;
                }
            });

            if (!_.isUndefined(foundRouteIndex)) {
                serverRoutes.splice(foundRouteIndex, 1);
            }

            self.app.server.routes[httpMethod] = serverRoutes;
        });
    },

    _eachRoute: function (routes, handleFunc) {
        routes = routes || this.routes;

        // Allow routes to be a function for delayed generation
        if (_.isFunction(routes)) {
            routes = routes();
        }

        var self = this;

        // Iterate through each http handler and routemap
        _.each(routes, function (routeMap, httpMethod) {
            // And each route and handler method name.
            _.each(routeMap, function (handlers, route) {
                // Force the handlers to be an array for consistent flow below
                if (!_.isArray(handlers)) {
                    handlers = [handlers];
                }

                // Generate the array of actual functions to handle the route
                handlers = _.map(handlers, function (handlerName) {
                    return self[handlerName];
                });

                // Let the function passed in handle the parameters
                handleFunc(httpMethod, route, handlers);
            });
        });
    }
});

module.exports = RoutePlugin;