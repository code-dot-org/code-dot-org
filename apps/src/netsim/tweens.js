/**
 * @overview Tween functions used to animate visualization elements.
 */
'use strict';

var valueOr = require('../utils').valueOr;

/**
 * Default tween duration in milliseconds
 * @type {number}
 * @const
 */
var DEFAULT_TWEEN_DURATION = 600;

/**
 * A four-arg interpolation function.
 *
 * @typedef {function} TweenFunction
 * @param {number} t - current Time, in milliseconds since tween began
 * @param {number} b - Begin value
 * @param {number} c - final Change in value
 * @param {number} d - total tween Duration
 * @returns {number} the interpolated value for the current time
 */

/**
 * Interpolates with a little back-and-forth over the target value at the end.
 * @type {TweenFunction}
 */
exports.easeOutElastic = function (t, b, c, d) {
  var s, p, a;
  s=1.70158;
  p=0;
  a=c;
  if (t===0) {
    return b;
  }
  if ((t/=d)===1) {
    return b+c;
  }
  if (!p) {
    p=d*0.3;
  }
  if (a < Math.abs(c)) {
    a=c;
    s=p/4;
  } else {
    s = p/(2*Math.PI) * Math.asin (c/a);
  }
  return a*Math.pow(2, -10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};

/**
 * Interpolates, accelerating as it goes.
 * @type {TweenFunction}
 */
exports.easeInQuad = function (t, b, c, d) {
  return c*(t/=d)*t + b;
};

/**
 * Interpolates, decelerating as it goes.
 * @type {TweenFunction}
 */
exports.easeOutQuad = function (t, b, c, d) {
  return -c*(t/=d)*(t-2) + b;
};

exports.easeInOutQuad = function (t, b, c, d) {
  if ((t/=d/2) < 1) {
    return c/2*t*t + b;
  }
  return -c/2 * ((--t)*(t-2) - 1) + b;
};

/**
 * Linear interpolation
 * @type {TweenFunction}
 */
exports.linear = function (t, b, c, d) {
  return c * (t / d) + b;
};

/**
 * Wraps a tween method with the state it needs to animate a property.
 * On creation, assumes that property's current value for start values.
 * Must be ticked to progress toward completion.
 *
 * @param {!Object} target - The object owning the property we want to animate
 * @param {!string} propertyName - Must be a valid property on target
 * @param {!number} endValue - The desired final value of the property
 * @param {number} [duration] - How long the tween should take in milliseconds,
 *        default 600ms
 * @param {TweenFunction} [tweenFunction] - A tween function, default linear
 * @constructor
 */
exports.TweenValueTo = function (target, propertyName, endValue, duration,
    tweenFunction) {
  /**
   * Will be set to TRUE when tween is completed.
   * @type {boolean}
   */
  this.isFinished = false;

  /**
   * Will be set on our first tick.
   * @type {number}
   * @private
   */
  this.startTime_ = undefined;

  /**
   * @type {Object}
   */
  this.target = target;

  /**
   * @type {string}
   * @private
   */
  this.propertyName = propertyName;

  /**
   * @type {TweenFunction}
   * @private
   */
  this.tweenFunction_ = valueOr(tweenFunction, exports.linear);

  /**
   * @type {number}
   * @private
   */
  this.startValue_ = target[propertyName];

  /**
   * @type {number}
   * @private
   */
  this.deltaValue_ = endValue - this.startValue_;

  /**
   * Duration of tween in milliseconds
   * @type {number}
   * @private
   */
  this.duration_ = valueOr(duration, DEFAULT_TWEEN_DURATION);
};

/**
 * @param {RunLoop.clock} clock
 */
exports.TweenValueTo.prototype.tick = function (clock) {
  if (this.startTime_ === undefined) {
    this.startTime_ = clock.time;
  }

  var timeSinceStart = clock.time - this.startTime_;

  if (this.deltaValue_ !== 0) {
    this.target[this.propertyName] = this.tweenFunction_(
        timeSinceStart,
        this.startValue_,
        this.deltaValue_,
        this.duration_
    );
  }

  if (timeSinceStart >= this.duration_) {
    this.target[this.propertyName] = this.startValue_ + this.deltaValue_;
    this.isFinished = true;
  }
};

exports.DoAfterDelay = function (target, duration, callback) {
  /**
   * Will be set to TRUE when tween is completed.
   * @type {boolean}
   */
  this.isFinished = false;


  /**
   * Will be set on our first tick.
   * @type {number}
   * @private
   */
  this.startTime_ = undefined;

  /**
   * @type {Object}
   */
  this.target = target;

  /**
   * @type {string}
   * @private
   */
  this.propertyName = null;

  /**
   * Duration of tween in milliseconds
   * @type {number}
   * @private
   */
  this.duration_ = duration;

  /**
   * Function to call when the duration has elapsed.
   * @type {function}
   */
  this.callback_ = callback;
};

/**
 * @param {RunLoop.clock} clock
 */
exports.DoAfterDelay.prototype.tick = function (clock) {
  if (this.startTime_ === undefined) {
    this.startTime_ = clock.time;
  }

  var timeSinceStart = clock.time - this.startTime_;
  if (timeSinceStart >= this.duration_) {
    this.callback_();
    this.isFinished = true;
  }
};
