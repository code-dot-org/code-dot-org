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
var utils = require('../utils');
var _ = utils.getLodash();

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Collidable.prototype.roamGrid = function(type) {

  // Do we have an active location in grid coords?  If not, determine it.
  if (this.gridX === undefined) {
    this.gridX = Math.floor(this.x / Studio.SQUARE_SIZE);
    this.gridY = Math.floor(this.y / Studio.SQUARE_SIZE);
  }

  // Have we reached the destination grid position?
  // If not, we're still sliding towards it.
  var reachedDestinationGridPosition = false;

  // Draw the item's current location.
  Studio.drawDebugRect("itemCenter", this.x, this.y, 3, 3);

  if (this.destGridX !== undefined) {
    // Draw the item's destination grid square.
    Studio.drawDebugRect(
      "roamGridDest", 
      this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
      this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
      Studio.SQUARE_SIZE, 
      Studio.SQUARE_SIZE);
  }

  // Has the item reached its destination grid position?
  // (There is a small margin of error to allow for per-update movements greater
  // than a single pixel.)
  if (this.destGridX !== undefined &&
      (Math.abs(this.x - (this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE)) < 3 &&
       Math.abs(this.y - (this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE)) < 3)) {
    this.gridX = this.destGridX;
    this.gridY = this.destGridY;
    reachedDestinationGridPosition = true;
  }

  // Are we missing a destination location in grid coords?
  // Or have we already reached our prior destination location in grid coords?
  // If not, determine it.
  if (this.destGridX === undefined || reachedDestinationGridPosition) {

    var sprite = Studio.sprite[0];

    var spriteX = sprite.x + sprite.width/2;
    var spriteY = sprite.y + sprite.height/2;

    // let's try scoring each square
    var candidates = [];

    var bufferDistance = 60;

    for (var candidateX = this.gridX - 1; candidateX <= this.gridX + 1; candidateX++) {
      for (var candidateY = this.gridY - 1; candidateY <= this.gridY + 1; candidateY++) {
        candidate = {gridX: candidateX, gridY: candidateY};
        candidate.score = 0;

        if (type == "roamGrid") {
          candidate.score ++;
        } else if (type == "chaseGrid") {
          if (candidateY == this.gridY - 1 && spriteY < this.y - bufferDistance) {
            candidate.score ++;
          } else if (candidateY == this.gridY + 1 && spriteY > this.y + bufferDistance) {
            candidate.score ++;
          }

          if (candidateX == this.gridX - 1 && spriteX < this.x - bufferDistance) {
            candidate.score ++;
          } else if (candidateX == this.gridX + 1 && spriteX > this.x + bufferDistance) {
            candidate.score ++;
          }
        } else if (type == "fleeGrid") {
          candidate.score = 1;
          if (candidateY == this.gridY - 1 && spriteY > this.y - bufferDistance) {
            candidate.score ++;
          } else if (candidateY == this.gridY + 1 && spriteY < this.y + bufferDistance) {
            candidate.score ++;
          }

          if (candidateX == this.gridX - 1 && spriteX > this.x - bufferDistance) {
            candidate.score ++;
          } else if (candidateX == this.gridX + 1 && spriteX < this.x + bufferDistance) {
            candidate.score ++;
          }
        }

        if (candidate.score > 0) {
          Studio.drawDebugRect(
            "roamGridPossibleDest", 
            candidateX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
            candidateY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
            Studio.SQUARE_SIZE, 
            Studio.SQUARE_SIZE);
        }
        candidates.push(candidate);
      }
    }

    // cull candidates that won't be possible
    for (var i = candidates.length-1; i >= 0; i--) {
      var candidate = candidates[i];
      var atEdge = candidate.gridX < 0 || candidate.gridX >= Studio.COLS ||
                   candidate.gridY < 0 || candidate.gridY >= Studio.ROWS;
      var hasWall = !atEdge && Studio.map[candidate.gridY][candidate.gridX] & SquareType.WALL;
      if (atEdge || hasWall || candidate.score === 0) {
        candidates.splice(i, 1);
      }
    }

    if (candidates.length > 0) {
      // shuffle everything (so that even scored items are shuffled, even after the sort)
      candidates = _.shuffle(candidates);

      // then sort everything based on score.
      candidates.sort(function (a, b) {
        return b.score - a.score;
      });

      this.destGridX = candidates[0].gridX;
      this.destGridY = candidates[0].gridY;

      // update towards the next location
      if (this.destGridX > this.gridX && this.destGridY > this.gridY) {
        this.dir = Direction.SOUTHEAST;
      } else if (this.destGridX > this.gridX && this.destGridY < this.gridY) {
        this.dir = Direction.NORTHEAST;
      } else if (this.destGridX < this.gridX && this.destGridY > this.gridY) {
        this.dir = Direction.SOUTHWEST;
      } else if (this.destGridX < this.gridX && this.destGridY < this.gridY) {
        this.dir = Direction.NORTHWEST;
      } else if (this.destGridX > this.gridX) {
        this.dir = Direction.EAST;
      } else if (this.destGridX < this.gridX) {
        this.dir = Direction.WEST;
      } else if (this.destGridY > this.gridY) {
        this.dir = Direction.SOUTH;
      } else if (this.destGridY < this.gridY) {
        this.dir = Direction.NORTH;
      } else {
        this.dir = Direction.NONE;
      }
    }
    else {
      this.dir = Direction.NONE;
    }
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
