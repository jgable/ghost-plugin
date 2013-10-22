'use strict';

var helpers = require('./helpers'),
    Plugin;

/**
 * Plugin is the base class for a standard plugin.
 * @class
 * @parameter {Ghost} The current Ghost app instance
 */
Plugin = function (ghost) {
    this.app = ghost;

    this.initialize();
};

/**
 * A method that is run after the constructor and allows for special logic
 */
Plugin.prototype.initialize = function () {
    return;
};

/** 
 * A method that will be called on installation.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
Plugin.prototype.install = function () {
    return;
};

/** 
 * A method that will be called on uninstallation.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
Plugin.prototype.uninstall = function () {
    return;
};

/** 
 * A method that will be called when the plugin is enabled.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
Plugin.prototype.activate = function () {
    return;
};

/** 
 * A method that will be called when the plugin is disabled.
 * Can optionally return a promise if async.
 * @parameter {Ghost} The current Ghost app instance
 */
Plugin.prototype.deactivate = function () {
    return;
};

// Offer an easy to use extend method.
Plugin.extend = helpers.extend;

module.exports = Plugin;