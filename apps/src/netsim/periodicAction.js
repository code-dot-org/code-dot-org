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
 * Utility for creating an action that occurs on a regular
 *               interval when hooked up to a RunLoop tick.
 * @param {function} action
 * @param {number} interval - time between calls to action in milliseconds
 * @returns {{tick: Function, enable: Function, disable: Function}}
 */
var periodicAction = function (action, interval) {
  var nextActionTime = Infinity;
  var actionInterval = interval;

  return {

    /**
     * Attach action to provided RunLoop tick event.
     * @param {RunLoop} runLoop
     */
    attachToRunLoop: function (runLoop) {
      runLoop.tick.register(this.tick);
    },

    /** @param clock */
    tick: function (clock) {
      if (clock.time >= nextActionTime) {
        action(clock);

        if (nextActionTime === 0) {
          nextActionTime = clock.time + actionInterval;
        } else {
          // Stable-increment
          while (nextActionTime < clock.time) {
            nextActionTime += actionInterval;
          }
        }
      }
    },

    /** Cause the action to resume running on the next tick. */
    enable: function () {
      if (nextActionTime === Infinity) {
        nextActionTime = 0;
      }
    },

    /** Cause the action to stop running. */
    disable: function () {
      nextActionTime = Infinity;
    },

    /**
     * Whether the periodic action is scheduled to fire again.
     * @returns {boolean}
     */
    isEnabled: function () {
      return nextActionTime !== Infinity;
    },

    /**
     * Change the interval at which action occurs
     * @param interval - time between calls to action in milliseconds
     */
    setActionInterval: function (interval) {
      actionInterval = interval;
    }

  };
};

module.exports = periodicAction;