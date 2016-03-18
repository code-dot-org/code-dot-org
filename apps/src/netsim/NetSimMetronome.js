/**
 * @overview UI component: An animated SVG metronome.
 */
'use strict';

var markup = require('./NetSimMetronome.html.ejs');

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
  runLoop.render.register(this.render.bind(this));
};

/**
 * Fill the root div with new elements reflecting the current state
 * @param {RunLoop.Clock} clock
 */
NetSimMetronome.prototype.render = function (clock) {
  if (!this.lastPulseTime_) {
    this.lastPulseTime_ = clock.time;
  }

  // An infinite interval means we're effectively paused, so snap to zero
  // progress (visualized as an "empty" meter)
  if (this.pulseIntervalMillis_ === Infinity) {
    this.progress_ = 0;
    this.pulseAge_ = Infinity;
  } else {
    // For a non-infinite interval, update the meter progress value according
    // to the current time.
    this.pulseAge_ = clock.time - this.lastPulseTime_;
    this.progress_ = Math.min(this.pulseAge_ / this.pulseIntervalMillis_, 1);

    if (this.pulseAge_ >= this.pulseIntervalMillis_) {
      // Pulse
      var minimumLastPulseTime = clock.time - this.pulseIntervalMillis_;
      while (this.lastPulseTime_ < minimumLastPulseTime) {
        this.lastPulseTime_ += this.pulseIntervalMillis_;
      }
    }
  }

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
