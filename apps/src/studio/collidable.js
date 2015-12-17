/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var Direction = require('./constants').Direction;
var constants = require('./constants');
var SquareType = constants.SquareType;

//
// Collidable constructor
//
// opts.image (URL)
// opts.width (pixels)
// opts.height (pixels)
// opts.x
// opts.y
// opts.dir (direction)
// opts.speed (speed)
// opts.frames
//

var Collidable = function (opts) {
  this.gridX = undefined;
  this.gridY = undefined;

  this.activity = "none";

  for (var prop in opts) {
    this[prop] = opts[prop];
  }
  this.visible = this.visible || true;
  this.flags = 0;
  // hash table of other sprites we're currently colliding with
  this.collidingWith_ = {};

  // default num frames is 1
  this.frames = this.frames || 1;

  /** @private {SpriteAction[]} */
  this.actions_ = [];
};

module.exports = Collidable;

/**
 * Clear all current collisions
 */
Collidable.prototype.clearCollisions = function () {
  this.collidingWith_ = {};
};

/**
 * Mark that we're colliding with object represented by key
 * @param key A unique key representing the object we're colliding with
 * @returns {boolean} True if collision is started, false if we're already colliding
 */
Collidable.prototype.startCollision = function (key) {
  if (this.isCollidingWith(key)) {
    return false;
  }

  this.collidingWith_[key] = true;
  return true;
};

/**
 * Mark that we're no longer colliding with object represented by key
 * @param key A unique key representing the object we're querying
 */
Collidable.prototype.endCollision = function (key) {
  this.collidingWith_[key] = false;
};

/**
 * Are we colliding with the object represented by key?
 * @param key A unique key representing the object we're querying
 */
Collidable.prototype.isCollidingWith = function (key) {
  return this.collidingWith_[key] === true;
};

Collidable.prototype.bounce = function () {
  switch (this.dir) {
    case Direction.NORTH:
      this.dir = Direction.SOUTH;
      break;
    case Direction.WEST:
      this.dir = Direction.EAST;
      break;
    case Direction.SOUTH:
      this.dir = Direction.NORTH;
      break;
    case Direction.EAST:
      this.dir = Direction.WEST;
      break;
    case Direction.NORTHEAST:
      this.dir = Direction.SOUTHWEST;
      break;
    case Direction.SOUTHEAST:
      this.dir = Direction.NORTHWEST;
      break;
    case Direction.SOUTHWEST:
      this.dir = Direction.NORTHEAST;
      break;
    case Direction.NORTHWEST:
      this.dir = Direction.SOUTHEAST;
      break;
  }
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Assumes x/y are center coords (true for projectiles and items)
 * outOfBounds() returns true if the object is entirely "off screen"
 */
Collidable.prototype.outOfBounds = function () {
  return (this.x < -(this.width / 2)) ||
         (this.x > studioApp.MAZE_WIDTH + (this.width / 2)) ||
         (this.y < -(this.height / 2)) ||
         (this.y > studioApp.MAZE_HEIGHT + (this.height / 2));
};

/**
 * Add an action (probably an animation) for this sprite to run.
 * Note: This is a 'sprouted' new system for updating sprites, separate from
 *       how older playlab stuff works.  For now it's driving the discrete
 *       movement hoc2015 levels.
 * @param {SpriteAction} action
 */
Collidable.prototype.addAction = function (action) {
  this.actions_.push(action);
};

/**
 * @returns {boolean} whether this sprite is currently running any actions.
 */
Collidable.prototype.hasActions = function () {
  return this.actions_.length > 0;
};

/**
 * Causes this sprite to update all actions it's currently running, and then
 * remove any that are complete.
 */
Collidable.prototype.updateActions = function () {
  this.actions_.forEach(function (action) {
    action.update(this);
  }, this);

  // Splice completed actions out of the current action list, iterating
  // backwards so we don't skip anything.
  for (var i = this.actions_.length - 1; i >= 0; i--) {
    if (this.actions_[i].isDone()) {
      this.actions_.splice(i, 1);
    }
  }
};

/**
 * Change visible opacity of this collidable sprite.
 * @param {number} newOpacity (between 0 and 1)
 */
Collidable.prototype.setOpacity = function (newOpacity) {
  var spriteIndex = Studio.sprite.indexOf(this);
  if (spriteIndex < 0) {
    return;
  }

  var spriteRegularIcon = document.getElementById('sprite' + spriteIndex);
  var spriteWalkIcon = document.getElementById('spriteWalk' + spriteIndex);
  if (spriteRegularIcon) {
    spriteRegularIcon.setAttribute('opacity', newOpacity);
  }
  if (spriteWalkIcon) {
    spriteWalkIcon.setAttribute('opacity', newOpacity);
  }
};
