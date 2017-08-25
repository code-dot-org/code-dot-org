
export const SpriteSpeed = {
  VERY_SLOW: 2,
  SLOW: 3,
  LITTLE_SLOW: 4,
  NORMAL: 5,
  LITTLE_FAST: 6,
  FAST: 8,
  VERY_FAST: 12,
};

export const SpriteSize = {
  VERY_SMALL: 0.5,
  SMALL: 0.75,
  NORMAL: 1,
  LARGE: 1.5,
  VERY_LARGE: 2
};

export const Direction = {
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

export const turnLeft90 = function (direction) {
  return direction >> 1 || Direction.WEST;
};

export const turnRight90 = function (direction) {
  return (direction << 1) & 0xF || Direction.NORTH;
};

const Dir = Direction;

/**
 * Mapping number of steps away from north to direction enum.
 * @type {Direction[]}
 */
export const ClockwiseDirectionsFromNorth = [
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
 * List of cardinal directions
 */
export const CardinalDirections = [
  Dir.NORTH,
  Dir.SOUTH,
  Dir.EAST,
  Dir.WEST
];

/**
 * Given a 2D vector (x and y) provides the closest animation direction
 * given in our Direction enum.
 * @param {number} x
 * @param {number} y
 * @returns {Direction}
 */
export const getClosestDirection = function (x, y) {
  // Y is inverted between our playlab coordinate space and what atan2 expects.
  const radiansFromNorth = Math.atan2(x, -y);
  const stepRadians = Math.PI / 4;
  // Snap positive index of nearest 45° where 0 is North, 1 is NE, etc...
  const stepsFromNorth = (Math.round(radiansFromNorth / stepRadians) + 8) % 8;
  // At this point we should have an int between 0 and 7
  return ClockwiseDirectionsFromNorth[stepsFromNorth];
};

export const frameDirTable = {};
frameDirTable[Dir.SOUTHEAST]  = 0;
frameDirTable[Dir.EAST]       = 1;
frameDirTable[Dir.NORTHEAST]  = 2;
frameDirTable[Dir.NORTH]      = 3;
frameDirTable[Dir.NORTHWEST]  = 4;
frameDirTable[Dir.WEST]       = 5;
frameDirTable[Dir.SOUTHWEST]  = 6;

export const frameDirTableWalking = {};
frameDirTableWalking[Dir.NONE]       = 0;
frameDirTableWalking[Dir.SOUTH]      = 0;
frameDirTableWalking[Dir.SOUTHEAST]  = 1;
frameDirTableWalking[Dir.EAST]       = 2;
frameDirTableWalking[Dir.NORTHEAST]  = 3;
frameDirTableWalking[Dir.NORTH]      = 4;
frameDirTableWalking[Dir.NORTHWEST]  = 5;
frameDirTableWalking[Dir.WEST]       = 6;
frameDirTableWalking[Dir.SOUTHWEST]  = 7;


// Forward-to-left (clockwise)
export const frameDirTableWalkingWithIdleClockwise = {};
frameDirTableWalkingWithIdleClockwise[Dir.NONE]       = 8;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTH]      = 0;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTHEAST]  = 1;
frameDirTableWalkingWithIdleClockwise[Dir.EAST]       = 2;
frameDirTableWalkingWithIdleClockwise[Dir.NORTHEAST]  = 3;
frameDirTableWalkingWithIdleClockwise[Dir.NORTH]      = 4;
frameDirTableWalkingWithIdleClockwise[Dir.NORTHWEST]  = 5;
frameDirTableWalkingWithIdleClockwise[Dir.WEST]       = 6;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTHWEST]  = 7;

// Forward-to-right (counter-clockwise)
export const frameDirTableWalkingWithIdleCounterclockwise = {};
frameDirTableWalkingWithIdleCounterclockwise[Dir.NONE]       = 8;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTH]      = 0;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTHEAST]  = 7;
frameDirTableWalkingWithIdleCounterclockwise[Dir.EAST]       = 6;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTHEAST]  = 5;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTH]      = 4;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTHWEST]  = 3;
frameDirTableWalkingWithIdleCounterclockwise[Dir.WEST]       = 2;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTHWEST]  = 1;

/**
 * Given a direction, returns the unit vector for it.
 */
export const UNIT_VECTOR = {};
UNIT_VECTOR[Dir.NONE] =  { x: 0, y: 0};
UNIT_VECTOR[Dir.NORTH] = { x: 0, y:-1};
UNIT_VECTOR[Dir.EAST]  = { x: 1, y: 0};
UNIT_VECTOR[Dir.SOUTH] = { x: 0, y: 1};
UNIT_VECTOR[Dir.WEST]  = { x:-1, y: 0};
UNIT_VECTOR[Dir.NORTHEAST] = { x: 1, y:-1};
UNIT_VECTOR[Dir.SOUTHEAST] = { x: 1, y: 1};
UNIT_VECTOR[Dir.SOUTHWEST] = { x:-1, y: 1};
UNIT_VECTOR[Dir.NORTHWEST] = { x:-1, y:-1};
Dir.getUnitVector = function (dir) {
  return UNIT_VECTOR[dir];
};


export const Position = {
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

export const NextTurn = {};

NextTurn[Dir.NORTH] = {};
NextTurn[Dir.NORTH][Dir.NORTH] = Dir.NORTH;
NextTurn[Dir.NORTH][Dir.EAST] = Dir.NORTHEAST;
NextTurn[Dir.NORTH][Dir.SOUTH] = Dir.NORTHEAST;
NextTurn[Dir.NORTH][Dir.NONE] = Dir.NORTHEAST;
NextTurn[Dir.NORTH][Dir.WEST] = Dir.NORTHWEST;
NextTurn[Dir.NORTH][Dir.NORTHEAST] = Dir.NORTHEAST;
NextTurn[Dir.NORTH][Dir.SOUTHEAST] = Dir.NORTHEAST;
NextTurn[Dir.NORTH][Dir.SOUTHWEST] = Dir.NORTHWEST;
NextTurn[Dir.NORTH][Dir.NORTHWEST] = Dir.NORTHWEST;

NextTurn[Dir.EAST] = {};
NextTurn[Dir.EAST][Dir.NORTH] = Dir.NORTHEAST;
NextTurn[Dir.EAST][Dir.EAST] = Dir.EAST;
NextTurn[Dir.EAST][Dir.SOUTH] = Dir.SOUTHEAST;
NextTurn[Dir.EAST][Dir.NONE] = Dir.SOUTHEAST;
NextTurn[Dir.EAST][Dir.WEST] = Dir.SOUTHEAST;
NextTurn[Dir.EAST][Dir.NORTHEAST] = Dir.NORTHEAST;
NextTurn[Dir.EAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
NextTurn[Dir.EAST][Dir.SOUTHWEST] = Dir.SOUTHEAST;
NextTurn[Dir.EAST][Dir.NORTHWEST] = Dir.NORTHEAST;

NextTurn[Dir.SOUTH] = {};
NextTurn[Dir.SOUTH][Dir.NORTH] = Dir.SOUTHEAST;
NextTurn[Dir.SOUTH][Dir.EAST] = Dir.SOUTHEAST;
NextTurn[Dir.SOUTH][Dir.SOUTH] = Dir.SOUTH;
NextTurn[Dir.SOUTH][Dir.NONE] = Dir.NONE;
NextTurn[Dir.SOUTH][Dir.WEST] = Dir.SOUTHWEST;
NextTurn[Dir.SOUTH][Dir.NORTHEAST] = Dir.SOUTHEAST;
NextTurn[Dir.SOUTH][Dir.SOUTHEAST] = Dir.SOUTHEAST;
NextTurn[Dir.SOUTH][Dir.SOUTHWEST] = Dir.SOUTHWEST;
NextTurn[Dir.SOUTH][Dir.NORTHWEST] = Dir.SOUTHWEST;

NextTurn[Dir.WEST] = {};
NextTurn[Dir.WEST][Dir.NORTH] = Dir.NORTHWEST;
NextTurn[Dir.WEST][Dir.EAST] = Dir.SOUTHWEST;
NextTurn[Dir.WEST][Dir.SOUTH] = Dir.SOUTHWEST;
NextTurn[Dir.WEST][Dir.NONE] = Dir.SOUTHWEST;
NextTurn[Dir.WEST][Dir.WEST] = Dir.WEST;
NextTurn[Dir.WEST][Dir.NORTHEAST] = Dir.NORTHWEST;
NextTurn[Dir.WEST][Dir.SOUTHEAST] = Dir.SOUTHWEST;
NextTurn[Dir.WEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
NextTurn[Dir.WEST][Dir.NORTHWEST] = Dir.NORTHWEST;

NextTurn[Dir.NORTHEAST] = {};
NextTurn[Dir.NORTHEAST][Dir.NORTH] = Dir.NORTH;
NextTurn[Dir.NORTHEAST][Dir.EAST] = Dir.EAST;
NextTurn[Dir.NORTHEAST][Dir.SOUTH] = Dir.EAST;
NextTurn[Dir.NORTHEAST][Dir.NONE] = Dir.EAST;
NextTurn[Dir.NORTHEAST][Dir.WEST] = Dir.NORTH;
NextTurn[Dir.NORTHEAST][Dir.NORTHEAST] = Dir.NORTHEAST;
NextTurn[Dir.NORTHEAST][Dir.SOUTHEAST] = Dir.EAST;
NextTurn[Dir.NORTHEAST][Dir.SOUTHWEST] = Dir.EAST;
NextTurn[Dir.NORTHEAST][Dir.NORTHWEST] = Dir.NORTH;

NextTurn[Dir.SOUTHEAST] = {};
NextTurn[Dir.SOUTHEAST][Dir.NORTH] = Dir.EAST;
NextTurn[Dir.SOUTHEAST][Dir.EAST] = Dir.EAST;
NextTurn[Dir.SOUTHEAST][Dir.SOUTH] = Dir.SOUTH;
NextTurn[Dir.SOUTHEAST][Dir.NONE] = Dir.SOUTH;
NextTurn[Dir.SOUTHEAST][Dir.WEST] = Dir.SOUTH;
NextTurn[Dir.SOUTHEAST][Dir.NORTHEAST] = Dir.EAST;
NextTurn[Dir.SOUTHEAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
NextTurn[Dir.SOUTHEAST][Dir.SOUTHWEST] = Dir.SOUTH;
NextTurn[Dir.SOUTHEAST][Dir.NORTHWEST] = Dir.SOUTH;

NextTurn[Dir.SOUTHWEST] = {};
NextTurn[Dir.SOUTHWEST][Dir.NORTH] = Dir.WEST;
NextTurn[Dir.SOUTHWEST][Dir.EAST] = Dir.SOUTH;
NextTurn[Dir.SOUTHWEST][Dir.SOUTH] = Dir.SOUTH;
NextTurn[Dir.SOUTHWEST][Dir.NONE] = Dir.SOUTH;
NextTurn[Dir.SOUTHWEST][Dir.WEST] = Dir.WEST;
NextTurn[Dir.SOUTHWEST][Dir.NORTHEAST] = Dir.SOUTH;
NextTurn[Dir.SOUTHWEST][Dir.SOUTHEAST] = Dir.SOUTH;
NextTurn[Dir.SOUTHWEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
NextTurn[Dir.SOUTHWEST][Dir.NORTHWEST] = Dir.WEST;

NextTurn[Dir.NORTHWEST] = {};
NextTurn[Dir.NORTHWEST][Dir.NORTH] = Dir.NORTH;
NextTurn[Dir.NORTHWEST][Dir.EAST] = Dir.NORTH;
NextTurn[Dir.NORTHWEST][Dir.SOUTH] = Dir.WEST;
NextTurn[Dir.NORTHWEST][Dir.NONE] = Dir.WEST;
NextTurn[Dir.NORTHWEST][Dir.WEST] = Dir.WEST;
NextTurn[Dir.NORTHWEST][Dir.NORTHEAST] = Dir.NORTH;
NextTurn[Dir.NORTHWEST][Dir.SOUTHEAST] = Dir.WEST;
NextTurn[Dir.NORTHWEST][Dir.SOUTHWEST] = Dir.WEST;
NextTurn[Dir.NORTHWEST][Dir.NORTHWEST] = Dir.NORTHWEST;

NextTurn[Dir.NONE] = {};
NextTurn[Dir.NONE][Dir.NORTH] = Dir.SOUTHEAST;
NextTurn[Dir.NONE][Dir.EAST] = Dir.SOUTHEAST;
NextTurn[Dir.NONE][Dir.SOUTH] = Dir.SOUTH;
NextTurn[Dir.NONE][Dir.NONE] = Dir.NONE;
NextTurn[Dir.NONE][Dir.WEST] = Dir.SOUTHWEST;
NextTurn[Dir.NONE][Dir.NORTHEAST] = Dir.SOUTHEAST;
NextTurn[Dir.NONE][Dir.SOUTHEAST] = Dir.SOUTHEAST;
NextTurn[Dir.NONE][Dir.SOUTHWEST] = Dir.SOUTHWEST;
NextTurn[Dir.NONE][Dir.NORTHWEST] = Dir.SOUTHWEST;

export const Emotions = {
  NORMAL: 0,
  HAPPY: 1,
  ANGRY: 2,
  SAD: 3
};

// scale the collision bounding box to make it so they need to overlap a touch:
export const FINISH_COLLIDE_DISTANCE_SCALING = 0.75;
export const SPRITE_COLLIDE_DISTANCE_SCALING = 0.9;

export const DEFAULT_SPRITE_SPEED = SpriteSpeed.NORMAL;
export const DEFAULT_SPRITE_SIZE = 1;
export const DEFAULT_SPRITE_ANIMATION_FRAME_DURATION = 6;

export const DEFAULT_PROJECTILE_SPEED = SpriteSpeed.SLOW;
export const DEFAULT_PROJECTILE_ANIMATION_FRAME_DURATION = 1.5;

export const DEFAULT_ITEM_SPEED = SpriteSpeed.SLOW;
export const DEFAULT_ITEM_ANIMATION_FRAME_DURATION = 1.5;


/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
export const SquareType = {
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

export const SquareItemClassMask =
  SquareType.ITEM_CLASS_0 |
  SquareType.ITEM_CLASS_1 |
  SquareType.ITEM_CLASS_2 |
  SquareType.ITEM_CLASS_3 |
  SquareType.ITEM_CLASS_4 |
  SquareType.ITEM_CLASS_5 |
  SquareType.ITEM_CLASS_6 |
  SquareType.ITEM_CLASS_7;

export const SquareItemClassShift = 5;

export function squareHasItemClass(itemClassIndex, squareValue) {
  const classesEnabled =
    (squareValue & SquareItemClassMask) >>> SquareItemClassShift;
  return Math.pow(2, itemClassIndex) & classesEnabled;
}

/**
 * The types of walls in the maze.
 * @enum {number}
 */
export const WallType = {
  NORMAL_SIZE: 0,
  DOUBLE_SIZE: 1,
  JUMBO_SIZE: 2
};

export const WallTypeMask     = 0x0F000000;
export const WallCoordRowMask = 0x00F00000;
export const WallCoordColMask = 0x000F0000;

export const WallCoordsMask =
  WallTypeMask | WallCoordRowMask | WallCoordColMask;
export const WallCoordsShift = 16;
export const WallCoordColShift  = WallCoordsShift;
export const WallCoordRowShift  = WallCoordsShift + 4;
export const WallTypeShift      = WallCoordsShift + 8;
export const WallCoordMax = 16; // indicates a 16x16 grid, which requires 8 bits
export const WallRandomCoordMax = 2; // how many rows/cols we randomly select tiles from

export const WallAnyMask = WallCoordsMask | SquareType.WALL;

// Floating score: change opacity and Y coordinate by these values each tick.
export const floatingScoreChangeOpacity = -0.025;
export const floatingScoreChangeY = -1;

export const RANDOM_VALUE = 'random';
export const HIDDEN_VALUE = '"hidden"';
export const CLICK_VALUE = '"click"';
export const VISIBLE_VALUE = '"visible"';

export const EMPTY_QUOTES = '""';

// Number of extra ticks between the last time the sprite moved and when we
// reset them to face south.
export const IDLE_TICKS_BEFORE_FACE_SOUTH = 4;

/** @type {number} animation rate in frames per second. */
export const DEFAULT_ANIMATION_RATE = 20;

// Fade durations (in milliseconds)
export const GOAL_FADE_TIME = 200;
export const ITEM_FADE_TIME = 200;
export const DEFAULT_ACTOR_FADE_TIME = 1000;
export const TOUCH_HAZARD_EFFECT_TIME = 1500;

// Other defaults for actions
export const SHAKE_DEFAULT_DURATION = 1000;
export const SHAKE_DEFAULT_CYCLES = 6;
export const SHAKE_DEFAULT_DISTANCE = 5;

// Maximum number of clouds that can be displayed.
export const MAX_NUM_CLOUDS = 2;

// Width & height of a cloud.
export const CLOUD_SIZE = 300;

// The opacity of a cloud.
export const CLOUD_OPACITY = 0.7;

// How many milliseconds to throttle between playing sounds.
export const SOUND_THROTTLE_TIME = 200;

// How many milliseconds to throttle between whenTouchObstacle events when
// blockMovingIntoWalls is enabled.
export const TOUCH_OBSTACLE_THROTTLE_TIME = 330;

export const BEHAVIOR_CHASE = 'chase';
export const BEHAVIOR_FLEE = 'flee';
export const BEHAVIOR_STOP = 'none';
export const BEHAVIOR_WANDER = 'roam';
export const BEHAVIOR_WATCH_ACTOR = 'watchActor';
export const BEHAVIOR_GRID_ALIGNED = 'grid';

// Take the screenshot almost immediately, hopefully catching the
// title screen and any characters in their initial positions.
export const CAPTURE_TICK_COUNT = 20;
