/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
export const Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

export const PADDLE_BALL_COLLIDE_DISTANCE = 0.7;
export const FINISH_COLLIDE_DISTANCE = 0.5;
export const DEFAULT_BALL_SPEED = 0.1;
export const DEFAULT_BALL_DIRECTION = 1.25 * Math.PI;
export const DEFAULT_PADDLE_SPEED = 0.1;
export const DEFAULT_BALL_START_Y = 2;
export const Y_TOP_BOUNDARY = -0.2;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
export const SquareType = {
  OPEN: 0,
  WALL: 1,
  GOAL: 2,
  BALLSTART: 4,
  PADDLEFINISH: 8,
  PADDLESTART: 16,
  BALLFINISH: 32,
  OBSTACLE: 64,
};
