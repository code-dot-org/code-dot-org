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
  this.pulseInterval_ = 2000;

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

NetSimMetronome.prototype.tick = function (clock) {
  if (!this.lastPulseTime_) {
    this.lastPulseTime_ = clock.time;
  }

  this.pulseAge_ = clock.time - this.lastPulseTime_;
  this.progress_ = Math.min(this.pulseAge_ / this.pulseInterval_, 1);

  if (this.pulseAge_ >= this.pulseInterval_) {
    // Pulse
    while (this.lastPulseTime_ < (clock.time - this.pulseInterval_)) {
      this.lastPulseTime_ += this.pulseInterval_;
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
