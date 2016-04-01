'use strict';

exports.SpriteSpeed = {
  VERY_SLOW: 2,
  SLOW: 3,
  LITTLE_SLOW: 4,
  NORMAL: 5,
  LITTLE_FAST: 6,
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

/**
 * Mapping number of steps away from north to direction enum.
 * @type {Direction[]}
 */
exports.ClockwiseDirectionsFromNorth = [
  Dir.NORTH,
  Dir.NORTHEAST,
  Dir.EAST,
  Dir.SOUTHEAST,
  Dir.SOUTH,
  Dir.SOUTHWEST,
  Dir.WEST,
  Dir.NORTHWEST
];

/**
 * Given a 2D vector (x and y) provides the closest animation direction
 * given in our Direction enum.
 * @param {number} x
 * @param {number} y
 * @returns {Direction}
 */
exports.getClosestDirection = function (x, y) {
  // Y is inverted between our playlab coordinate space and what atan2 expects.
  var radiansFromNorth = Math.atan2(x, -y);
  var stepRadians = Math.PI / 4;
  // Snap positive index of nearest 45° where 0 is North, 1 is NE, etc...
  var stepsFromNorth = (Math.round(radiansFromNorth / stepRadians) + 8) % 8;
  // At this point we should have an int between 0 and 7
  return exports.ClockwiseDirectionsFromNorth[stepsFromNorth];
};

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


// Forward-to-left (clockwise)
var frameDirTableWalkingWithIdleClockwise = {};
frameDirTableWalkingWithIdleClockwise[Dir.NONE]       = 8;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTH]      = 0;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTHEAST]  = 1;
frameDirTableWalkingWithIdleClockwise[Dir.EAST]       = 2;
frameDirTableWalkingWithIdleClockwise[Dir.NORTHEAST]  = 3;
frameDirTableWalkingWithIdleClockwise[Dir.NORTH]      = 4;
frameDirTableWalkingWithIdleClockwise[Dir.NORTHWEST]  = 5;
frameDirTableWalkingWithIdleClockwise[Dir.WEST]       = 6;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTHWEST]  = 7;

exports.frameDirTableWalkingWithIdleClockwise = frameDirTableWalkingWithIdleClockwise;

// Forward-to-right (counter-clockwise)
var frameDirTableWalkingWithIdleCounterclockwise = {};
frameDirTableWalkingWithIdleCounterclockwise[Dir.NONE]       = 8;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTH]      = 0;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTHEAST]  = 7;
frameDirTableWalkingWithIdleCounterclockwise[Dir.EAST]       = 6;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTHEAST]  = 5;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTH]      = 4;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTHWEST]  = 3;
frameDirTableWalkingWithIdleCounterclockwise[Dir.WEST]       = 2;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTHWEST]  = 1;

exports.frameDirTableWalkingWithIdleCounterclockwise = frameDirTableWalkingWithIdleCounterclockwise;

/**
 * Given a direction, returns the unit vector for it.
 */
var UNIT_VECTOR = {};
UNIT_VECTOR[Dir.NONE] =  {x: 0, y: 0};
UNIT_VECTOR[Dir.NORTH] = {x: 0, y:-1};
UNIT_VECTOR[Dir.EAST]  = {x: 1, y: 0};
UNIT_VECTOR[Dir.SOUTH] = {x: 0, y: 1};
UNIT_VECTOR[Dir.WEST]  = {x:-1, y: 0};
UNIT_VECTOR[Dir.NORTHEAST] = {x: 1, y:-1};
UNIT_VECTOR[Dir.SOUTHEAST] = {x: 1, y: 1};
UNIT_VECTOR[Dir.SOUTHWEST] = {x:-1, y: 1};
UNIT_VECTOR[Dir.NORTHWEST] = {x:-1, y:-1};
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
exports.NextTurn[Dir.NORTH][Dir.NONE] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.WEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHWEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.EAST] = {};
exports.NextTurn[Dir.EAST][Dir.NORTH] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.EAST][Dir.SOUTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NONE] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.WEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHWEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHWEST] = Dir.NORTHEAST;

exports.NextTurn[Dir.SOUTH] = {};
exports.NextTurn[Dir.SOUTH][Dir.NORTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.EAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTH][Dir.NONE] = Dir.NONE;
exports.NextTurn[Dir.SOUTH][Dir.WEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHWEST] = Dir.SOUTHWEST;

exports.NextTurn[Dir.WEST] = {};
exports.NextTurn[Dir.WEST][Dir.NORTH] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.EAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTH] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.NONE] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.WEST][Dir.NORTHEAST] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHEAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.NORTHEAST] = {};
exports.NextTurn[Dir.NORTHEAST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTH] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.NONE] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.WEST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHEAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHWEST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHWEST] = Dir.NORTH;

exports.NextTurn[Dir.SOUTHEAST] = {};
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTH] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NONE] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.WEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHEAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHWEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHWEST] = Dir.SOUTH;

exports.NextTurn[Dir.SOUTHWEST] = {};
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTH] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.EAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.NONE] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHWEST] = Dir.WEST;

exports.NextTurn[Dir.NORTHWEST] = {};
exports.NextTurn[Dir.NORTHWEST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.EAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTH] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NONE] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHEAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHEAST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHWEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.NONE] = {};
exports.NextTurn[Dir.NONE][Dir.NORTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.EAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.NONE][Dir.NONE] = Dir.NONE;
exports.NextTurn[Dir.NONE][Dir.WEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.NONE][Dir.NORTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.NONE][Dir.NORTHWEST] = Dir.SOUTHWEST;

exports.Emotions = {
  NORMAL: 0,
  HAPPY: 1,
  ANGRY: 2,
  SAD: 3
};

// scale the collision bounding box to make it so they need to overlap a touch:
exports.FINISH_COLLIDE_DISTANCE_SCALING = 0.75;
exports.SPRITE_COLLIDE_DISTANCE_SCALING = 0.9;

exports.DEFAULT_SPRITE_SPEED = exports.SpriteSpeed.NORMAL;
exports.DEFAULT_SPRITE_SIZE = 1;
exports.DEFAULT_SPRITE_ANIMATION_FRAME_DURATION = 6;

exports.DEFAULT_PROJECTILE_SPEED = exports.SpriteSpeed.SLOW;
exports.DEFAULT_PROJECTILE_ANIMATION_FRAME_DURATION = 1.5;

exports.DEFAULT_ITEM_SPEED = exports.SpriteSpeed.SLOW;
exports.DEFAULT_ITEM_ANIMATION_FRAME_DURATION = 1.5;


/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
exports.SquareType = {
  OPEN:         0,
  SPRITEFINISH: 1,
  NOT_USED_2:   2,
  WALL:         4,  // random wall tile
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
  NOT_USED_8K:  8192,
  NOT_USED_16K: 16384,
  NOT_USED_32K: 32768
  // Walls specifically retrieved from an 16x16 grid are stored in bits 16-27.
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

/**
 * The types of walls in the maze.
 * @enum {number}
 */
exports.WallType = {
  NORMAL_SIZE: 0,
  DOUBLE_SIZE: 1,
  JUMBO_SIZE: 2
};

exports.WallTypeMask     = 0x0F000000;
exports.WallCoordRowMask = 0x00F00000;
exports.WallCoordColMask = 0x000F0000;

exports.WallCoordsMask =
  exports.WallTypeMask | exports.WallCoordRowMask | exports.WallCoordColMask;
exports.WallCoordsShift = 16;
exports.WallCoordColShift  = exports.WallCoordsShift;
exports.WallCoordRowShift  = exports.WallCoordsShift + 4;
exports.WallTypeShift      = exports.WallCoordsShift + 8;
exports.WallCoordMax = 16; // indicates a 16x16 grid, which requires 8 bits
exports.WallRandomCoordMax = 2; // how many rows/cols we randomly select tiles from

exports.WallAnyMask = exports.WallCoordsMask | exports.SquareType.WALL;

// Floating score: change opacity and Y coordinate by these values each tick.
exports.floatingScoreChangeOpacity = -0.025;
exports.floatingScoreChangeY = -1;

exports.RANDOM_VALUE = 'random';
exports.HIDDEN_VALUE = '"hidden"';
exports.CLICK_VALUE = '"click"';
exports.VISIBLE_VALUE = '"visible"';

// Number of extra ticks between the last time the sprite moved and when we
// reset them to face south.
exports.IDLE_TICKS_BEFORE_FACE_SOUTH = 4;

/** @type {number} animation rate in frames per second. */
exports.DEFAULT_ANIMATION_RATE = 20;

// Fade durations (in milliseconds)
exports.GOAL_FADE_TIME = 200;
exports.ITEM_FADE_TIME = 200;
exports.DEFAULT_ACTOR_FADE_TIME = 1000;
exports.TOUCH_HAZARD_EFFECT_TIME = 1500;

// Other defaults for actions
exports.SHAKE_DEFAULT_DURATION = 1000;
exports.SHAKE_DEFAULT_CYCLES = 6;
exports.SHAKE_DEFAULT_DISTANCE = 5;

// Maximum number of clouds that can be displayed.
exports.MAX_NUM_CLOUDS = 2;

// Width & height of a cloud.
exports.CLOUD_SIZE = 300;

// The opacity of a cloud.
exports.CLOUD_OPACITY = 0.7;

// How many milliseconds to throttle between playing sounds.
exports.SOUND_THROTTLE_TIME = 200;

// How many milliseconds to throttle between whenTouchObstacle events when
// blockMovingIntoWalls is enabled.
exports.TOUCH_OBSTACLE_THROTTLE_TIME = 330;
