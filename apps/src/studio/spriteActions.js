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
 * @constructor
 */
exports.MoveAndCancel = function (towardDeltaX, towardDeltaY, totalSteps) {
  this.towardDeltaX_ = towardDeltaX;
  this.towardDeltaY_ = towardDeltaY;
  this.totalSteps_ = totalSteps;
  this.elapsedSteps_ = 0;
};

exports.MoveAndCancel.prototype.update = function (sprite) {
  var normalizedProgress = (this.elapsedSteps_ + 1) / this.totalSteps_;
  var motionProgress = normalizedProgress < 0.5 ? normalizedProgress :
      (1 - normalizedProgress);
  sprite.displayX = sprite.x + this.towardDeltaX_ * motionProgress;
  sprite.displayY = sprite.y + this.towardDeltaY_ * motionProgress;
  sprite.dir = getDirection(this.towardDeltaX_, this.towardDeltaY_);
  this.elapsedSteps_++;
};

exports.MoveAndCancel.prototype.isDone = function () {
  return this.elapsedSteps_ >= this.totalSteps_;
};

function getDirection(deltaX, deltaY) {
  var dir = Direction.NONE;
  if (deltaX < 0) {
    dir |= Direction.WEST;
  } else if (deltaX > 0) {
    dir |= Direction.EAST;
  }
  if (deltaY < 0) {
    dir |= Direction.NORTH;
  } else if (deltaY > 0) {
    dir |= Direction.SOUTH;
  }
  return dir;
}
