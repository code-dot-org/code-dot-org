export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 */
export enum SquareType {
  OPEN = 0,
  SPRITEFINISH = 1,
  NOT_USED_2 = 2,
  WALL = 4, // random wall tile
  NOT_USED_8 = 8,
  SPRITESTART = 16,
  ITEM_CLASS_0 = 32, // Must stay in sync with SquareItemClassShift below
  ITEM_CLASS_1 = 64,
  ITEM_CLASS_2 = 128,
  ITEM_CLASS_3 = 256,
  ITEM_CLASS_4 = 512,
  ITEM_CLASS_5 = 1024,
  ITEM_CLASS_6 = 2048,
  ITEM_CLASS_7 = 4096,
  NOT_USED_8K = 8192,
  NOT_USED_16K = 16384,
  NOT_USED_32K = 32768,
  // Walls specifically retrieved from an 16x16 grid are stored in bits 16-27.
}

export enum SpriteSpeed {
  VERY_SLOW = 2,
  SLOW = 3,
  LITTLE_SLOW = 4,
  NORMAL = 5,
  LITTLE_FAST = 6,
  FAST = 8,
  VERY_FAST = 12,
}

export enum Behavior {
  CHASE = 'chase',
  FLEE = 'flee',
  STOP = 'none',
  WANDER = 'roam',
  WATCH_ACTOR = 'watchActor',
  GRID_ALIGNED = 'grid',
}

export enum WallType {
  NORMAL_SIZE = 0,
  DOUBLE_SIZE = 1,
  JUMBO_SIZE = 2,
}

export enum Emotions {
  NORMAL = 0,
  HAPPY = 1,
  ANGRY = 2,
  SAD = 3,
}

export enum Direction {
  NONE = 0,
  NORTH = 1,
  EAST = 2,
  SOUTH = 4,
  WEST = 8,
  NORTHEAST = 3,
  SOUTHEAST = 6,
  SOUTHWEST = 12,
  NORTHWEST = 9,
}

export const NextTurn: {
  [key in Direction]: {
    [key in Direction]: number;
  };
} = {
  [Direction.NORTH]: {
    [Direction.NORTH]: Direction.NORTH,
    [Direction.EAST]: Direction.NORTHEAST,
    [Direction.SOUTH]: Direction.NORTHEAST,
    [Direction.NONE]: Direction.NORTHEAST,
    [Direction.WEST]: Direction.NORTHWEST,
    [Direction.NORTHEAST]: Direction.NORTHEAST,
    [Direction.SOUTHEAST]: Direction.NORTHEAST,
    [Direction.SOUTHWEST]: Direction.NORTHWEST,
    [Direction.NORTHWEST]: Direction.NORTHWEST,
  },
  [Direction.EAST]: {
    [Direction.NORTH]: Direction.NORTHEAST,
    [Direction.EAST]: Direction.EAST,
    [Direction.SOUTH]: Direction.SOUTHEAST,
    [Direction.NONE]: Direction.SOUTHEAST,
    [Direction.WEST]: Direction.SOUTHEAST,
    [Direction.NORTHEAST]: Direction.NORTHEAST,
    [Direction.SOUTHEAST]: Direction.SOUTHEAST,
    [Direction.SOUTHWEST]: Direction.SOUTHEAST,
    [Direction.NORTHWEST]: Direction.NORTHEAST,
  },
  [Direction.SOUTH]: {
    [Direction.NORTH]: Direction.SOUTHEAST,
    [Direction.EAST]: Direction.SOUTHEAST,
    [Direction.SOUTH]: Direction.SOUTH,
    [Direction.NONE]: Direction.NONE,
    [Direction.WEST]: Direction.SOUTHWEST,
    [Direction.NORTHEAST]: Direction.SOUTHEAST,
    [Direction.SOUTHEAST]: Direction.SOUTHEAST,
    [Direction.SOUTHWEST]: Direction.SOUTHWEST,
    [Direction.NORTHWEST]: Direction.SOUTHWEST,
  },
  [Direction.WEST]: {
    [Direction.NORTH]: Direction.NORTHWEST,
    [Direction.EAST]: Direction.SOUTHWEST,
    [Direction.SOUTH]: Direction.SOUTHWEST,
    [Direction.NONE]: Direction.SOUTHWEST,
    [Direction.WEST]: Direction.WEST,
    [Direction.NORTHEAST]: Direction.NORTHWEST,
    [Direction.SOUTHEAST]: Direction.SOUTHWEST,
    [Direction.SOUTHWEST]: Direction.SOUTHWEST,
    [Direction.NORTHWEST]: Direction.NORTHWEST,
  },
  [Direction.NORTHEAST]: {
    [Direction.NORTH]: Direction.NORTH,
    [Direction.EAST]: Direction.EAST,
    [Direction.SOUTH]: Direction.EAST,
    [Direction.NONE]: Direction.EAST,
    [Direction.WEST]: Direction.NORTH,
    [Direction.NORTHEAST]: Direction.NORTHEAST,
    [Direction.SOUTHEAST]: Direction.EAST,
    [Direction.SOUTHWEST]: Direction.EAST,
    [Direction.NORTHWEST]: Direction.NORTH,
  },
  [Direction.SOUTHEAST]: {
    [Direction.NORTH]: Direction.EAST,
    [Direction.EAST]: Direction.EAST,
    [Direction.SOUTH]: Direction.SOUTH,
    [Direction.NONE]: Direction.SOUTH,
    [Direction.WEST]: Direction.SOUTH,
    [Direction.NORTHEAST]: Direction.EAST,
    [Direction.SOUTHEAST]: Direction.SOUTHEAST,
    [Direction.SOUTHWEST]: Direction.SOUTH,
    [Direction.NORTHWEST]: Direction.SOUTH,
  },
  [Direction.SOUTHWEST]: {
    [Direction.NORTH]: Direction.WEST,
    [Direction.EAST]: Direction.SOUTH,
    [Direction.SOUTH]: Direction.SOUTH,
    [Direction.NONE]: Direction.SOUTH,
    [Direction.WEST]: Direction.WEST,
    [Direction.NORTHEAST]: Direction.SOUTH,
    [Direction.SOUTHEAST]: Direction.SOUTH,
    [Direction.SOUTHWEST]: Direction.SOUTHWEST,
    [Direction.NORTHWEST]: Direction.WEST,
  },
  [Direction.NORTHWEST]: {
    [Direction.NORTH]: Direction.NORTH,
    [Direction.EAST]: Direction.NORTH,
    [Direction.SOUTH]: Direction.WEST,
    [Direction.NONE]: Direction.WEST,
    [Direction.WEST]: Direction.WEST,
    [Direction.NORTHEAST]: Direction.NORTH,
    [Direction.SOUTHEAST]: Direction.WEST,
    [Direction.SOUTHWEST]: Direction.WEST,
    [Direction.NORTHWEST]: Direction.NORTHWEST,
  },
  [Direction.NONE]: {
    [Direction.NORTH]: Direction.SOUTHEAST,
    [Direction.EAST]: Direction.SOUTHEAST,
    [Direction.SOUTH]: Direction.SOUTH,
    [Direction.NONE]: Direction.NONE,
    [Direction.WEST]: Direction.SOUTHWEST,
    [Direction.NORTHEAST]: Direction.SOUTHEAST,
    [Direction.SOUTHEAST]: Direction.SOUTHEAST,
    [Direction.SOUTHWEST]: Direction.SOUTHWEST,
    [Direction.NORTHWEST]: Direction.SOUTHWEST,
  },
};

export const WallTypeMask = 0x0f000000;
export const WallCoordRowMask = 0x00f00000;
export const WallCoordColMask = 0x000f0000;

export const WallCoordsMask =
  WallTypeMask | WallCoordRowMask | WallCoordColMask;
export const WallCoordsShift = 16;
export const WallCoordColShift = WallCoordsShift;
export const WallCoordRowShift = WallCoordsShift + 4;
export const WallTypeShift = WallCoordsShift + 8;
export const WallAnyMask = WallCoordsMask | SquareType.WALL;
export const WallRandomCoordMax = 2; // how many rows/cols we randomly select tiles from

export const RANDOM_VALUE = 'random';
export const HIDDEN_VALUE = '"hidden"';
export const CLICK_VALUE = '"click"';
export const VISIBLE_VALUE = '"visible"';

// Maximum number of clouds that can be displayed.
export const MAX_NUM_CLOUDS = 2;

// Width & height of a cloud.
export const CLOUD_SIZE = 300;

// The opacity of a cloud.
export const CLOUD_OPACITY = 0.7;

export const SCORE_TEXT_Y_POSITION = 30; // bottom of text
export const VICTORY_TEXT_Y_POSITION = 130;
export const RESET_TEXT_Y_POSITION = 380;

export const TITLE_SCREEN_TIMEOUT = 5000;
export const TITLE_SCREEN_TITLE_Y_POSITION = 60; // bottom of title text
export const TITLE_SCREEN_TEXT_Y_POSITION = 100; // top of text group
export const TITLE_SCREEN_TEXT_SIDE_MARGIN = 20;
export const TITLE_SCREEN_TEXT_LINE_HEIGHT = 24;
export const TITLE_SCREEN_TEXT_MAX_LINES = 7;
export const TITLE_SCREEN_TEXT_TOP_MARGIN = 5;
export const TITLE_SCREEN_TEXT_V_PADDING = 15;
export const TITLE_SCREEN_TEXT_WIDTH = 360;
export const TITLE_SCREEN_TEXT_HEIGHT =
  TITLE_SCREEN_TEXT_TOP_MARGIN +
  TITLE_SCREEN_TEXT_V_PADDING +
  TITLE_SCREEN_TEXT_MAX_LINES * TITLE_SCREEN_TEXT_LINE_HEIGHT;

export const DEFAULT_ITEM_SPEED = SpriteSpeed.SLOW;
export const DEFAULT_ITEM_ANIMATION_FRAME_DURATION = 1.5;

export const DEFAULT_SPRITE_SPEED = SpriteSpeed.NORMAL;
export const DEFAULT_SPRITE_SIZE = 1;
export const DEFAULT_SPRITE_ANIMATION_FRAME_DURATION = 6;

// Fade durations (in milliseconds)
export const GOAL_FADE_TIME = 200;
export const ITEM_FADE_TIME = 200;
export const DEFAULT_ACTOR_FADE_TIME = 1000;
export const TOUCH_HAZARD_EFFECT_TIME = 1500;

export type DirectionTable = {
  [key in Direction]: number;
};

export const FrameDirTable: DirectionTable = {
  [Direction.NONE]: 0,
  [Direction.SOUTH]: 0,
  [Direction.SOUTHEAST]: 0,
  [Direction.EAST]: 1,
  [Direction.NORTHEAST]: 2,
  [Direction.NORTH]: 3,
  [Direction.NORTHWEST]: 4,
  [Direction.WEST]: 5,
  [Direction.SOUTHWEST]: 6,
};

export const FrameDirTableWalking: DirectionTable = {
  [Direction.NONE]: 0,
  [Direction.SOUTH]: 0,
  [Direction.SOUTHEAST]: 1,
  [Direction.EAST]: 2,
  [Direction.NORTHEAST]: 3,
  [Direction.NORTH]: 4,
  [Direction.NORTHWEST]: 5,
  [Direction.WEST]: 6,
  [Direction.SOUTHWEST]: 7,
};

export const FrameDirTableWalkingWithIdleClockwise: DirectionTable = {
  [Direction.NONE]: 8,
  [Direction.SOUTH]: 0,
  [Direction.SOUTHEAST]: 1,
  [Direction.EAST]: 2,
  [Direction.NORTHEAST]: 3,
  [Direction.NORTH]: 4,
  [Direction.NORTHWEST]: 5,
  [Direction.WEST]: 6,
  [Direction.SOUTHWEST]: 7,
};

export const FrameDirTableWalkingWithIdleCounterClockwise: DirectionTable = {
  [Direction.NONE]: 8,
  [Direction.SOUTH]: 0,
  [Direction.SOUTHEAST]: 7,
  [Direction.EAST]: 6,
  [Direction.NORTHEAST]: 5,
  [Direction.NORTH]: 4,
  [Direction.NORTHWEST]: 3,
  [Direction.WEST]: 2,
  [Direction.SOUTHWEST]: 1,
};

export const UNIT_VECTOR: {
  [key in Direction]: {
    x: number;
    y: number;
  };
} = {
  [Direction.NONE]: {x: 0, y: 0},
  [Direction.NORTH]: {x: 0, y: -1},
  [Direction.EAST]: {x: 1, y: 0},
  [Direction.SOUTH]: {x: 0, y: 1},
  [Direction.WEST]: {x: -1, y: 0},
  [Direction.NORTHEAST]: {x: 1, y: -1},
  [Direction.SOUTHEAST]: {x: 1, y: 1},
  [Direction.SOUTHWEST]: {x: -1, y: 1},
  [Direction.NORTHWEST]: {x: -1, y: -1},
};

// Other defaults for actions
export const SHAKE_DEFAULT_DURATION = 1000;
export const SHAKE_DEFAULT_CYCLES = 6;
export const SHAKE_DEFAULT_DISTANCE = 5;

/**
 * Mapping number of steps away from north to direction enum.
 */
export const ClockwiseDirectionsFromNorth: Direction[] = [
  Direction.NORTH,
  Direction.NORTHEAST,
  Direction.EAST,
  Direction.SOUTHEAST,
  Direction.SOUTH,
  Direction.SOUTHWEST,
  Direction.WEST,
  Direction.NORTHWEST,
];

/**
 * List of cardinal directions
 */
export const CardinalDirections: Direction[] = [
  Direction.NORTH,
  Direction.SOUTH,
  Direction.EAST,
  Direction.WEST,
];

/**
 * Given a 2D vector (x and y) provides the closest animation direction
 * given in our Direction enum.
 */
export function getClosestDirection(x: number, y: number): Direction {
  // Y is inverted between our playlab coordinate space and what atan2 expects.
  const radiansFromNorth = Math.atan2(x, -y);
  const stepRadians = Math.PI / 4;

  // Snap positive index of nearest 45° where 0 is North, 1 is NE, etc...
  const stepsFromNorth = (Math.round(radiansFromNorth / stepRadians) + 8) % 8;

  // At this point we should have an int between 0 and 7
  return ClockwiseDirectionsFromNorth[stepsFromNorth];
}

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

export function squareHasItemClass(
  itemClassIndex: number,
  squareValue: number,
): boolean {
  const classesEnabled =
    (squareValue & SquareItemClassMask) >>> SquareItemClassShift;
  return !!(Math.pow(2, itemClassIndex) & classesEnabled);
}
