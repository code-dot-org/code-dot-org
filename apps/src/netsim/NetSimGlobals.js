/**
 * @overview Global singleton used to simplify certain cross-cutting concerns,
 *           including:
 *
 *           Access to level configuration.
 *           Access to environment-specific asset URLs.
 *           Reproducible random number functions for easy testing.
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
 * Get a random integer in the given range.
 * @param {number} low inclusive lower end of range
 * @param {number} high exclusive upper end of range
 * @returns {number}
 */
var randomIntInRange = function (low, high) {
  return Math.floor(pseudoRandomNumberFunction_() * (high - low)) + low;
};

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
   * @returns {NetSimLevelConfiguration}
   */
  getLevelConfig: function () {
    return netsim_.level;
  },

  /**
   * @returns {PubSubConfig}
   */
  getPubSubConfig: function () {
    return {
      usePusher: netsim_.usePusher,
      pusherApplicationKey: netsim_.pusherApplicationKey
    };
  },

  /**
   * @returns {number}
   */
  getGlobalMaxRouters: function () {
    return netsim_.globalMaxRouters;
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
   * Trigger an attempt to complete the current level and continue to the next.
   */
  completeLevelAndContinue: function () {
    netsim_.completeLevelAndContinue();
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
   * @returns {number} a random value between 0 and 1
   */
  random: function () {
    return pseudoRandomNumberFunction_();
  },

  /**
   * Get a random integer in the given range.
   * @param {number} low inclusive lower end of range
   * @param {number} high exclusive upper end of range
   * @returns {number}
   */
  randomIntInRange: randomIntInRange,

  /**
   * Get a random item out of a collection
   * @param {Array} collection
   * @returns {*} undefined if collection is empty
   */
  randomPickOne: function (collection) {
    var size = collection.length;
    if (size === 0) {
      return undefined;
    }

    return collection[randomIntInRange(0, size)];
  }

};
