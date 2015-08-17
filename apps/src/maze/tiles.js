'use strict';

var utils = require('../utils');

var Tiles = module.exports;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Tiles.Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

/**
 * The types of squares in the Maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Tiles.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3,
  OBSTACLE: 4,
  STARTANDFINISH: 5
};

Tiles.TurnDirection = { LEFT: -1, RIGHT: 1};
Tiles.MoveDirection = { FORWARD: 0, RIGHT: 1, BACKWARD: 2, LEFT: 3};

Tiles.directionToDxDy = function(direction) {
  switch (direction) {
    case Tiles.Direction.NORTH:
      return {dx: 0, dy: -1};
    case Tiles.Direction.EAST:
      return {dx: 1, dy: 0};
    case Tiles.Direction.SOUTH:
      return {dx: 0, dy: 1};
    case Tiles.Direction.WEST:
      return {dx: -1, dy: 0};
  }
  throw new Error('Invalid direction value' + direction);
};

Tiles.directionToFrame = function(direction4) {
  return utils.mod(direction4 * 4, 16);
};

/**
 * Keep the direction within 0-3, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Tiles.constrainDirection4 = function(d) {
  return utils.mod(d, 4);
};
