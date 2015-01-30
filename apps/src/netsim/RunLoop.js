/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Simple run-loop manager
 */

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
/* global window */
'use strict';

var _ = require('../utils').getLodash();
var ObservableEvent = require('./ObservableEvent');

// It is more accurate to use performance.now(), but we use Date.now()
// for compatibility with Safari and older browsers. This should only cause
// a small error in the deltaTime for the initial frame anyway.
// See Also:
// * https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
// * https://developer.mozilla.org/en-US/docs/Web/API/Performance.now
var windowNow = (window.performance && window.performance.now) ?
    _.bind(window.performance.now, window.performance) : Date.now;

/**
 * Ticks per second on older browsers where we can't lock to the repaint event.
 * @type {number}
 * @const
 */
var FALLBACK_FPS = 30;

/**
 * Precalculated milliseconds per tick for fallback case
 * @type {number}
 * @const
 */
var FALLBACK_MS_PER_TICK = (1000 / FALLBACK_FPS);



/**
 *
 * @constructor
 */
var RunLoop = function () {

  /**
   * Whether the run-loop will continue running.
   * @type {boolean}
   */
  this.enabled = false;

  /**
   * Tracks current time and delta time for the loop.
   * Passed to observers when events fire.
   * @type {RunClock}
   */
  this.clock = new RunLoop.Clock();

  /**
   * Method that gets called over and over.
   * @type {Function}
   * @private
   */
  this.tick_ = this.buildTickMethod_();

  /**
   *
   * @type {ObservableEvent}
   */
  this.tick = new ObservableEvent();

  /**
   *
   * @type {ObservableEvent}
   */
  this.render = new ObservableEvent();
};
module.exports = RunLoop;

/**
 * Simple tracking for time values
 * @constructor
 */
RunLoop.Clock = function () {
  /**
   * Time the current/most recent tick started, in ms.
   * Depending on browser this might be epoch time or time since load -
   *  therefore, don't use for absolute time!
   * TODO (bbuchanan) : Could wrap this to absolutely be time-since-begin
   *                    independent of implementation.
   * @type {number}
   */
  this.time = windowNow();

  /**
   * Time in ms between the latest/current tick and the previous tick.
   * Precision dependent on browser capabilities.
   * @type {number}
   */
  this.deltaTime = 0;
};

RunLoop.prototype.buildTickMethod_ = function () {
  var tickMethod;
  var self = this;
  if (window.requestAnimationFrame) {
    tickMethod = function (hiResTimeStamp) {
      if (self.enabled) {
        self.clock.deltaTime = hiResTimeStamp - self.clock.time;
        self.clock.time = hiResTimeStamp;
        self.tick.notify(self.clock);
        self.render.notify(self.clock);
        requestAnimationFrame(tickMethod);
      }
    };
  } else {
    tickMethod = function () {
      if (self.enabled) {
        var curTime = windowNow();
        self.clock.deltaTime = curTime - self.clock.time;
        self.clock.time = curTime;
        self.tick.notify(self.clock);
        self.render.notify(self.clock);
        setTimeout(tickMethod, FALLBACK_MS_PER_TICK - self.clock.deltaTime);
      }
    };
  }
  return tickMethod;
};

/**
 * Start the run loop (runs immediately)
 */
RunLoop.prototype.begin = function () {
  this.enabled = true;
  this.clock.time = windowNow();
  this.tick_(this.clock.time);
};

/**
 * Stop the run loop
 * If in the middle of a tick, will finish the current tick.
 * If called by an event between ticks, will prevent the next tick from firing.
 */
RunLoop.prototype.end = function () {
  this.enabled = false;
};
