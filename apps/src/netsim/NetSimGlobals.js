/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

/**
 * Singleton access to global simulation settings.
 * @param {NetSim} netsim
 * @constructor
 */
var NetSimGlobals = module.exports = function () {
  /**
   * Reference to root NetSim controller
   * @type {NetSim}
   * @private
   */
  this.netsim_ = null;
};

/**
 * Global singleton
 * @type {NetSimGlobals}
 */
var singletonInstance;

/**
 * Static getter/lazy-creator for the global singleton instance.
 * @returns {NetSimLogger}
 */
NetSimGlobals.getSingleton = function () {
  if (singletonInstance === undefined) {
    singletonInstance = new NetSimGlobals();
  }
  return singletonInstance;
};

/**
 * Set the root controller that can be used for global operations.
 * @param {NetSim} netsim
 */
NetSimGlobals.prototype.setRootController = function (netsim) {
  this.netsim_ = netsim;
};

NetSimGlobals.prototype.getLevelConfig = function () {
  return this.netsim_.level;
};
