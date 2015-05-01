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
   * Set the root controller that can be used for global operations.
   * @param {NetSim} netsim
   */
  setRootController: function (netsim) {
    netsim_ = netsim;
  },

  /**
   * @returns {netsimLevelConfiguration}
   */
  getLevelConfig: function () {
    return netsim_.level;
  }

};
