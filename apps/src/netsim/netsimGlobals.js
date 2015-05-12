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
  }

};
