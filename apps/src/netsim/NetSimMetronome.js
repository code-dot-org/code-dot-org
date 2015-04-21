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
/* global $ */
'use strict';

var markup = require('./NetSimMetronome.html');

/**
 * An SVG "metronome", in the form of a radial meter that fills and resets
 * at a regular interval.
 *
 * @param {jQuery} rootDiv
 * @param {RunLoop} runLoop
 * @constructor
 */
var NetSimMetronome = module.exports = function (rootDiv, runLoop) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * Time of last pulse, in RunLoop simulation time
   * @type {number}
   * @private
   */
  this.lastPulseTime_ = undefined;

  /**
   * Milliseconds between metronome pulses
   * @type {number}
   * @private
   */
  this.pulseIntervalMillis_ = 0;

  /**
   * Normalized progress toward the next pulse, from 0.0 to 1.0
   * @type {number}
   * @private
   */
  this.progress_ = 0;

  /**
   * How long it's been since the last pulse in ms
   * @type {number}
   * @private
   */
  this.pulseAge_ = 0;

  // Register with run loop
  runLoop.tick.register(this.tick.bind(this));
  runLoop.render.register(this.render.bind(this));
};

/**
 * Update internal state as time passes.
 * @param {RunLoop.Clock} clock
 */
NetSimMetronome.prototype.tick = function (clock) {
  if (!this.lastPulseTime_) {
    this.lastPulseTime_ = clock.time;
  }

  // An infinite interval means we're effectively paused, so snap to zero
  // progress (visualized as an "empty" meter)
  if (this.pulseIntervalMillis_ === Infinity) {
    this.progress_ = 0;
    this.pulseAge_ = Infinity;
    return;
  }

  this.pulseAge_ = clock.time - this.lastPulseTime_;
  this.progress_ = Math.min(this.pulseAge_ / this.pulseIntervalMillis_, 1);

  if (this.pulseAge_ >= this.pulseIntervalMillis_) {
    // Pulse
    var minimumLastPulseTime = clock.time - this.pulseIntervalMillis_;
    while (this.lastPulseTime_ < minimumLastPulseTime) {
      this.lastPulseTime_ += this.pulseIntervalMillis_;
    }
  }
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimMetronome.prototype.render = function () {
  var renderedMarkup = $(markup({
    progress: this.progress_,
    pulseAge: this.pulseAge_
  }));
  this.rootDiv_.html(renderedMarkup);
};

/**
 * Change the metronome speed
 * @param {number} pulsesPerSecond
 */
NetSimMetronome.prototype.setFrequency = function (pulsesPerSecond) {
  if (pulsesPerSecond === 0 || pulsesPerSecond === Infinity) {
    this.pulseIntervalMillis_ = Infinity;
    return;
  }
  this.pulseIntervalMillis_ = 1000 / pulsesPerSecond;
};
