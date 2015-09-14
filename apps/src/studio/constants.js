'use strict';

exports.SpriteSpeed = {
  VERY_SLOW: 2,
  SLOW: 3,
  NORMAL: 5,
  FAST: 8,
  VERY_FAST: 12,
};

exports.SpriteSize = {
  VERY_SMALL: 0.5,
  SMALL: 0.75,
  NORMAL: 1,
  LARGE: 1.5,
  VERY_LARGE: 2
};

exports.Direction = {
  NONE: 0,
  NORTH: 1,
  EAST: 2,
  SOUTH: 4,
  WEST: 8,
  NORTHEAST: 3,
  SOUTHEAST: 6,
  SOUTHWEST: 12,
  NORTHWEST: 9
};

var Dir = exports.Direction;


var frameDirTable = {};
frameDirTable[Dir.SOUTHEAST]  = 0;
frameDirTable[Dir.EAST]       = 1;
frameDirTable[Dir.NORTHEAST]  = 2;
frameDirTable[Dir.NORTH]      = 3;
frameDirTable[Dir.NORTHWEST]  = 4;
frameDirTable[Dir.WEST]       = 5;
frameDirTable[Dir.SOUTHWEST]  = 6;

exports.frameDirTable = frameDirTable;

var frameDirTableWalking = {};
frameDirTableWalking[Dir.NONE]       = 0;
frameDirTableWalking[Dir.SOUTH]      = 0;
frameDirTableWalking[Dir.SOUTHEAST]  = 1;
frameDirTableWalking[Dir.EAST]       = 2;
frameDirTableWalking[Dir.NORTHEAST]  = 3;
frameDirTableWalking[Dir.NORTH]      = 4;
frameDirTableWalking[Dir.NORTHWEST]  = 5;
frameDirTableWalking[Dir.WEST]       = 6;
frameDirTableWalking[Dir.SOUTHWEST]  = 7;

exports.frameDirTableWalking = frameDirTableWalking;

/**
 * Given a direction, returns the unit vector for it.
 */
var UNIT_VECTOR = {};
UNIT_VECTOR[Dir.NONE] =  { x: 0, y: 0};
UNIT_VECTOR[Dir.NORTH] = { x: 0, y:-1};
UNIT_VECTOR[Dir.EAST]  = { x: 1, y: 0};
UNIT_VECTOR[Dir.SOUTH] = { x: 0, y: 1};
UNIT_VECTOR[Dir.WEST]  = { x:-1, y: 0};
UNIT_VECTOR[Dir.NORTHEAST] = { x: 1, y:-1};
UNIT_VECTOR[Dir.SOUTHEAST] = { x: 1, y: 1};
UNIT_VECTOR[Dir.SOUTHWEST] = { x:-1, y: 1};
UNIT_VECTOR[Dir.NORTHWEST] = { x:-1, y:-1};
exports.Direction.getUnitVector = function (dir) {
  return UNIT_VECTOR[dir];
};


exports.Position = {
  OUTTOPOUTLEFT:    1,
  OUTTOPLEFT:       2,
  OUTTOPCENTER:     3,
  OUTTOPRIGHT:      4,
  OUTTOPOUTRIGHT:   5,
  TOPOUTLEFT:       6,
  TOPLEFT:          7,
  TOPCENTER:        8,
  TOPRIGHT:         9,
  TOPOUTRIGHT:      10,
  MIDDLEOUTLEFT:    11,
  MIDDLELEFT:       12,
  MIDDLECENTER:     13,
  MIDDLERIGHT:      14,
  MIDDLEOUTRIGHT:   15,
  BOTTOMOUTLEFT:    16,
  BOTTOMLEFT:       17,
  BOTTOMCENTER:     18,
  BOTTOMRIGHT:      19,
  BOTTOMOUTRIGHT:   20,
  OUTBOTTOMOUTLEFT: 21,
  OUTBOTTOMLEFT:    22,
  OUTBOTTOMCENTER:  23,
  OUTBOTTOMRIGHT:   24,
  OUTBOTTOMOUTRIGHT:25
};

//
// Turn state machine, use as NextTurn[fromDir][toDir]
//

exports.NextTurn = {};

exports.NextTurn[Dir.NORTH] = {};
exports.NextTurn[Dir.NORTH][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTH][Dir.EAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTH] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.WEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHWEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.EAST] = {};
exports.NextTurn[Dir.EAST][Dir.NORTH] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.EAST][Dir.SOUTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.WEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHWEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHWEST] = Dir.NORTHEAST;

exports.NextTurn[Dir.SOUTH] = {};
exports.NextTurn[Dir.SOUTH][Dir.NORTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.EAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTH][Dir.WEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHWEST] = Dir.SOUTHWEST;

exports.NextTurn[Dir.WEST] = {};
exports.NextTurn[Dir.WEST][Dir.NORTH] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.EAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTH] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.WEST][Dir.NORTHEAST] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHEAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.NORTHEAST] = {};
exports.NextTurn[Dir.NORTHEAST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTH] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.WEST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHEAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHWEST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHWEST] = Dir.NORTH;

exports.NextTurn[Dir.SOUTHEAST] = {};
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTH] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.WEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHEAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHWEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHWEST] = Dir.SOUTH;

exports.NextTurn[Dir.SOUTHWEST] = {};
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTH] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.EAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHWEST] = Dir.WEST;

exports.NextTurn[Dir.NORTHWEST] = {};
exports.NextTurn[Dir.NORTHWEST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.EAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTH] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHEAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHEAST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHWEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHWEST] = Dir.NORTHWEST;


exports.Emotions = {
  NORMAL: 0,
  HAPPY: 1,
  ANGRY: 2,
  SAD: 3
};

// scale the collision bounding box to make it so they need to overlap a touch:
exports.FINISH_COLLIDE_DISTANCE_SCALING = 0.75;
exports.SPRITE_COLLIDE_DISTANCE_SCALING = 0.9;
exports.DEFAULT_SPRITE_SPEED = 5;
exports.DEFAULT_SPRITE_SIZE = 1;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
exports.SquareType = {
  OPEN:         0,
  SPRITEFINISH: 1,
  NOT_USED_2:   2,
  WALL:         4,
  NOT_USED_8:   8,
  SPRITESTART:  16,
  ITEM_CLASS_0: 32, // Must stay in sync with SquareItemClassShift below
  ITEM_CLASS_1: 64,
  ITEM_CLASS_2: 128,
  ITEM_CLASS_3: 256,
  ITEM_CLASS_4: 512,
  ITEM_CLASS_5: 1024,
  ITEM_CLASS_6: 2048,
  ITEM_CLASS_7: 4096,
};

exports.SquareItemClassMask =
  exports.SquareType.ITEM_CLASS_0 |
  exports.SquareType.ITEM_CLASS_1 |
  exports.SquareType.ITEM_CLASS_2 |
  exports.SquareType.ITEM_CLASS_3 |
  exports.SquareType.ITEM_CLASS_4 |
  exports.SquareType.ITEM_CLASS_5 |
  exports.SquareType.ITEM_CLASS_6 |
  exports.SquareType.ITEM_CLASS_7;

exports.SquareItemClassShift = 5;

exports.squareHasItemClass = function (itemClassIndex, squareValue) {
  var classesEnabled =
    (squareValue & exports.SquareItemClassMask) >>> exports.SquareItemClassShift;
  return Math.pow(2, itemClassIndex) & classesEnabled;
};

exports.RANDOM_VALUE = 'random';
exports.HIDDEN_VALUE = '"hidden"';
exports.CLICK_VALUE = '"click"';
exports.VISIBLE_VALUE = '"visible"';
