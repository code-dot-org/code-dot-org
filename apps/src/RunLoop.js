/* global window */
'use strict';

var ObservableEvent = require('./ObservableEvent');

// It is more accurate to use performance.now(), but we use Date.now()
// for compatibility with Safari and older browsers. This should only cause
// a small error in the deltaTime for the initial frame anyway.
// See Also:
// * https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
// * https://developer.mozilla.org/en-US/docs/Web/API/Performance.now
var windowNow = (window.performance && window.performance.now) ?
    window.performance.now.bind(window.performance) : Date.now;

/**
 * How many ticks we try to fire every second.
 * @type {number}
 * @const
 */
var PREFERRED_TICKS_PER_SECOND = 10;

/**
 * Precalculated milliseconds per tick.
 * @type {number}
 * @const
 */
var PREFERRED_MS_PER_TICK = (1000 / PREFERRED_TICKS_PER_SECOND);

/**
 * Rendered frames per second on older browsers where we can't lock to the
 * repaint event.
 * @type {number}
 * @const
 */
var FALLBACK_FPS = 30;

/**
 * Precalculated milliseconds per frame for fallback case
 * @type {number}
 * @const
 */
var FALLBACK_MS_PER_FRAME = (1000 / FALLBACK_FPS);



/**
 * Simple run-loop manager
 * @constructor
 */
var RunLoop = module.exports = function () {

  /**
   * Whether the run-loop will continue running.
   * @type {boolean}
   */
  this.enabled = false;

  /**
   * Tracks current time and delta time for the tick loop.
   * Passed to observers when events fire.
   * @type {RunLoop.Clock}
   */
  this.tickClock = new RunLoop.Clock();

  /**
   * Tracks current time and delta time for the render loop.
   * Passed to observers when events fire.
   * @type {RunLoop.Clock}
   */
  this.renderClock = new RunLoop.Clock();

  /**
   * Method that gets called over and over, regardless of whether NetSim
   * is in focus or not.  Called less often than render().  Can be slowed
   * to about once per second when NetSim is in the background.
   * @type {Function}
   * @private
   */
  this.tick_ = this.buildTickMethod_();

  /**
   * Method that gets called over and over when NetSim is visible.  Gets as
   * close to maximum framerate as possible.  Called more often than tick(), but
   * can be paused entirely when NetSim is in the background.
   * @type {Function}
   * @private
   */
  this.render_ = this.buildRenderMethod_();

  /**  @type {ObservableEvent} */
  this.tick = new ObservableEvent();

  /** @type {ObservableEvent} */
  this.render = new ObservableEvent();
};

/**
 * Simple tracking for time values
 * @constructor
 */
RunLoop.Clock = function () {
  /**
   * Time the current/most recent tick started, in ms.
   * Depending on browser this might be epoch time or time since load -
   *  therefore, don't use for absolute time!
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
  tickMethod = function () {
    if (self.enabled) {
      var curTime = windowNow();
      self.tickClock.deltaTime = curTime - self.tickClock.time;
      self.tickClock.time = curTime;
      self.tick.notifyObservers(self.tickClock);
      setTimeout(tickMethod, PREFERRED_MS_PER_TICK - self.tickClock.deltaTime);
    }
  };
  return tickMethod;
};

RunLoop.prototype.buildRenderMethod_ = function () {
  var renderMethod;
  var self = this;
  if (window.requestAnimationFrame) {
    renderMethod = function (hiResTimeStamp) {
      if (self.enabled) {
        self.renderClock.deltaTime = hiResTimeStamp - self.renderClock.time;
        self.renderClock.time = hiResTimeStamp;
        self.render.notifyObservers(self.renderClock);
        requestAnimationFrame(renderMethod);
      }
    };
  } else {
    renderMethod = function () {
      if (self.enabled) {
        var curTime = windowNow();
        self.renderClock.deltaTime = curTime - self.renderClock.time;
        self.renderClock.time = curTime;
        self.render.notifyObservers(self.renderClock);
        setTimeout(renderMethod, FALLBACK_MS_PER_FRAME - self.renderClock.deltaTime);
      }
    };
  }
  return renderMethod;
};

/** Start the run loop (runs immediately) */
RunLoop.prototype.begin = function () {
  this.enabled = true;
  this.tickClock.time = windowNow();
  this.renderClock.time = windowNow();
  this.tick_(this.tickClock.time);
  this.render_(this.renderClock.time);
};

/**
 * Stop the run loop
 * If in the middle of a tick, will finish the current tick.
 * If called by an event between ticks, will prevent the next tick from firing.
 */
RunLoop.prototype.end = function () {
  this.enabled = false;
};
