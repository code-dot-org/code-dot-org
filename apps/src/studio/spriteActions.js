/** @file Actions that can be given to a playlab sprite to execute over a set time. */
'use strict';

var constants = require('./constants');
var Direction = constants.Direction;

/*
Note: All sprite actions must, for now, take be able to complete in a provided
number of steps/frames, instead of blocking until they complete.  The latter
is a larger change that we'll save until later.
 */

/**
 * Move sprite partway toward a desired destination position, but have it
 * stop and reverse to its original position after a moment, as if it was
 * bouncing off a wall.
 * @constructor
 * @param {number} towardDeltaX - the relative target X position, if the motion
 *        was completed instead of cancelled (e.g. one grid-space away).
 * @param {number} towardDeltaY - as above.
 * @param {number} totalSteps - the number of steps (or frames) to take for the
 *        animation.
 */
exports.MoveAndCancel = function (towardDeltaX, towardDeltaY, totalSteps) {
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
exports.MoveAndCancel.prototype.update = function (sprite) {
  var normalizedProgress = (this.elapsedSteps_ + 1) / this.totalSteps_;
  var percentOffset = (2 * this.percentBeforeReverse_) *
      (normalizedProgress < 0.5 ? normalizedProgress : (1 - normalizedProgress));
  sprite.displayX = sprite.x + this.towardDeltaX_ * percentOffset;
  sprite.displayY = sprite.y + this.towardDeltaY_ * percentOffset;
  sprite.dir = getDirection(this.towardDeltaX_, this.towardDeltaY_);
  // Could do a forced reversal of animation here, depends on how it looks
  // with the real assets.
  this.elapsedSteps_++;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          animation is complete, based on the number of steps that have
 *          elapsed.
 */
exports.MoveAndCancel.prototype.isDone = function () {
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
