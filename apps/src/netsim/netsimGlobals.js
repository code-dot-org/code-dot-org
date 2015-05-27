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

var seedrandom = require('seedrandom');

/**
 * Reference to root StudioApp controller
 * @type {StudioApp}
 * @private
 */
var studioApp_ = null;

/**
 * Reference to root NetSim controller
 * @type {NetSim}
 * @private
 */
var netsim_ = null;

/**
 * Replacable pseudo-random number generator function that lets us set a global
 * random seed if we wish.
 * @type {function}
 * @private
 */
var pseudoRandomNumberFunction_ = Math.random;

/**
 * Provide singleton access to global simulation settings
 */
module.exports = {

  /**
   * Set the root controllers that can be used for global operations.
   * @param {StudioApp} studioApp
   * @param {NetSim} netsim
   */
  setRootControllers: function (studioApp, netsim) {
    studioApp_ = studioApp;
    netsim_ = netsim;
  },

  /**
   * @returns {netsimLevelConfiguration}
   */
  getLevelConfig: function () {
    return netsim_.level;
  },

  /**
   * @returns {function}
   */
  getAssetUrlFunction: function () {
    return studioApp_.assetUrl;
  },

  /**
   * Trigger a layout update of the right column, received/sent/send panels.
   */
  updateLayout: function () {
    netsim_.updateLayout();
  },

  /**
   * Reseed the random number generator.  If this is never called, the default
   * Math.random function is used as the generator.
   * @param {string} newSeed
   */
  setRandomSeed: function (newSeed) {
    pseudoRandomNumberFunction_ = seedrandom(newSeed);
  },

  /**
   * Get a random integer in the given range.
   * @param {number} low inclusive lower end of range
   * @param {number} high exclusive upper end of range
   * @returns {number}
   */
  randomIntInRange: function (low, high) {
    return Math.floor(pseudoRandomNumberFunction_() * (high - low)) + low;
  }

};
