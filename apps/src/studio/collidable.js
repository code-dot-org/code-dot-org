/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var Direction = require('./constants').Direction;

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
  for (var prop in opts) {
    this[prop] = opts[prop];
  }
  this.visible = this.visible || true;
  this.flags = 0;
  // hash table of other sprites we're currently colliding with
  this.collidingWith_ = {};

  // default num frames is 1
  this.frames = this.frames || 1;
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
