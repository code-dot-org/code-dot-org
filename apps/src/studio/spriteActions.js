/** @file Actions that can be given to a playlab sprite to execute over a set time. */
'use strict';

var utils = require('../utils');
var constants = require('./constants');
var Direction = constants.Direction;

/**
 * Work/animation for a sprite to do that will require more than one tick/frame.
 *
 * See Collidable#queueAction and Collidable#updateActions for usage.
 *
 * Note: All sprite actions must, for now, be able to complete in a provided
 * number of steps/frames, instead of blocking until they complete.  The latter
 * is a larger change that we'll save until later.
 *
 * @interface SpriteAction
 */

/**
 * Perform one tick/frame step of the action on the given sprite.
 *
 * @function
 * @name SpriteAction#update
 * @param {Collidable} sprite - the sprite the action is being performed on
 */

/**
 * Perform one tick/frame step of the action on the given sprite.
 *
 * @function
 * @name SpriteAction#isDone
 * @returns {boolean} whether the action is finished running.
 */

/**
 * Move sprite by a desired delta over a certain number of steps/ticks.
 * Used to provide discrete grid movement in playlab's continuous interpreted
 * environment.
 * @constructor
 * @implements {SpriteAction}
 * @param {number} towardDeltaX
 * @param {number} towardDeltaY
 * @param {number} totalSteps
 */
exports.GridMove = function (towardDeltaX, towardDeltaY, totalSteps) {
  this.towardDeltaX_ = towardDeltaX;
  this.towardDeltaY_ = towardDeltaY;
  this.totalSteps_ = totalSteps;
  this.elapsedSteps_ = 0;

  /** @private {number} How much of the full distance to travel. */
  this.percentBeforeReverse_ = 0.3;
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.GridMove.prototype.update = function (sprite) {
  // Logically snap the sprite to its final position on the first frame,
  // the interpolation is for display only.
  if (this.elapsedSteps_ === 0) {
    this.startX_ = sprite.x;
    this.startY_ = sprite.y;
    sprite.x += this.towardDeltaX_;
    sprite.y += this.towardDeltaY_;
  }
  var normalizedProgress = (this.elapsedSteps_ + 1) / this.totalSteps_;
  sprite.displayX = this.startX_ + this.towardDeltaX_ * normalizedProgress;
  sprite.displayY = this.startY_ + this.towardDeltaY_ * normalizedProgress;
  sprite.setDirection(getDirection(this.towardDeltaX_, this.towardDeltaY_));
  this.elapsedSteps_++;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          animation is complete, based on the number of steps that have
 *          elapsed.
 */
exports.GridMove.prototype.isDone = function () {
  return this.elapsedSteps_ >= this.totalSteps_;
};

/**
 * Move sprite partway toward a desired destination position, but have it
 * stop and reverse to its original position after a moment, as if it was
 * bouncing off a wall.
 * @constructor
 * @implements {SpriteAction}
 * @param {number} towardDeltaX - the relative target X position, if the motion
 *        was completed instead of cancelled (e.g. one grid-space away).
 * @param {number} towardDeltaY - as above.
 * @param {number} totalSteps - the number of steps (or frames) to take for the
 *        animation.
 */
exports.GridMoveAndCancel = function (towardDeltaX, towardDeltaY, totalSteps) {
  this.towardDeltaX_ = towardDeltaX;
  this.towardDeltaY_ = towardDeltaY;
  this.totalSteps_ = totalSteps;
  this.elapsedSteps_ = 0;

  /** @private {number} How much of the full distance to travel. */
  this.percentBeforeReverse_ = 0.3;
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.GridMoveAndCancel.prototype.update = function (sprite) {
  // Note: The sprite's logical position (sprite.x, sprite.y) never changes
  //       for this action.
  var normalizedProgress = (this.elapsedSteps_ + 1) / this.totalSteps_;
  var percentOffset = (2 * this.percentBeforeReverse_) *
      (normalizedProgress < 0.5 ? normalizedProgress : (1 - normalizedProgress));
  sprite.displayX = sprite.x + this.towardDeltaX_ * percentOffset;
  sprite.displayY = sprite.y + this.towardDeltaY_ * percentOffset;
  sprite.setDirection(getDirection(this.towardDeltaX_, this.towardDeltaY_));
  // Could do a forced reversal of animation here, depends on how it looks
  // with the real assets.
  this.elapsedSteps_++;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          animation is complete, based on the number of steps that have
 *          elapsed.
 */
exports.GridMoveAndCancel.prototype.isDone = function () {
  return this.elapsedSteps_ >= this.totalSteps_;
};

/**
 * Given a 2D vector (x and y) provides the approximate animation direction
 * given in our Direction enum.  Does not calculate 'closest' direction or
 * anything like that - you'll always get a diagonal if both x and y are nonzero.
 * @param {number} x
 * @param {number} y
 * @returns {Direction}
 */
function getDirection(x, y) {
  var dir = Direction.NONE;
  if (x < 0) {
    dir |= Direction.WEST;
  } else if (x > 0) {
    dir |= Direction.EAST;
  }
  if (y < 0) {
    dir |= Direction.NORTH;
  } else if (y > 0) {
    dir |= Direction.SOUTH;
  }
  return dir;
}

/**
 * Fade an actor out to nothing.
 * @param {number} [fadeDuration] how long it should take to fade out, in
 *        milliseconds.  Default to 1 second.
 * @constructor
 * @implements {SpriteAction}
 */
exports.FadeActor = function (fadeDuration) {
  /** @private {number} */
  this.startFadeTime_ = null;

  /** @private {number} */
  this.fadeDurationMs_ = utils.valueOr(fadeDuration, constants.DEFAULT_ACTOR_FADE_TIME);
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.FadeActor.prototype.update = function (sprite) {
  if (!this.startFadeTime_) {
    // First frame of fade
    this.startFadeTime_ = new Date().getTime();
  }

  var currentTime = new Date().getTime();
  var opacity = 1 - (currentTime - this.startFadeTime_) / this.fadeDurationMs_;
  opacity = Math.max(opacity, 0);
  sprite.setOpacity(opacity);
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          fade is complete, based on the elapsed time.
 */
exports.FadeActor.prototype.isDone = function () {
  var currentTime = new Date().getTime();
  return this.startFadeTime_ && currentTime > this.startFadeTime_ + this.fadeDurationMs_;
};

/**
 * Shake an actor left and right for a moment.
 * @param {number} [shakeDuration] how long it should take to fade out, in
 *        milliseconds.  Default to 1 second.
 * @constructor
 * @implements {SpriteAction}
 */
exports.ShakeActor = function (shakeDuration) {
  /** @private {number} */
  this.startShakeTime_ = null;

  /** @private {number} How long to shake, in milliseconds */
  this.shakeDurationMs_ = utils.valueOr(shakeDuration,
      constants.SHAKE_DEFAULT_DURATION);

  /** @private {number} How many complete back-and-forth shakes occur */
  this.cycleCount_ = constants.SHAKE_DEFAULT_CYCLES;

  /** @private {number} max shake distance from real position */
  this.amplitude_ = constants.SHAKE_DEFAULT_DISTANCE;

  /** @private {number} precalculated angular frequency of sine wave equation. */
  this.angularFrequency_ = 2 * Math.PI * (this.cycleCount_ / this.shakeDurationMs_);
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.ShakeActor.prototype.update = function (sprite) {
  if (!this.startShakeTime_) {
    // First frame of fade
    this.startShakeTime_ = new Date().getTime();
  }

  var elapsedTime = new Date().getTime() - this.startShakeTime_;
  var offset = this.amplitude_ * Math.sin(this.angularFrequency_ * elapsedTime);

  sprite.displayX = sprite.x + offset;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          fade is complete, based on the elapsed time.
 */
exports.ShakeActor.prototype.isDone = function () {
  var currentTime = new Date().getTime();
  return this.startShakeTime_ &&
      currentTime > this.startShakeTime_ +this.shakeDurationMs_;
};
