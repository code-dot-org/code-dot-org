import type {MazeController, Tiles, WordSearch} from '@code-dot-org/maze';

import ExecutionInfo from '@/components/level/mazeLevel/ExecutionInfo';

export interface APIGlobals {
  controller: MazeController;
  executionInfo: ExecutionInfo;
  tiles: Tiles;
}

/**
 * Only call API functions if we haven't yet terminated execution
 */

export const API_FUNCTION = function (
  this: APIGlobals,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (this: APIGlobals, ...args: any[]) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...rest: any[]
) {
  if (!this.executionInfo.isTerminated()) {
    console.log(fn, this, rest);
    fn.apply(this, rest);
  }
};

/**
 * Check whether all goals have been accomplished
 */
function checkSuccess(this: APIGlobals) {
  const succeeded = false; //this.resultsHandler.succeeded();

  if (succeeded) {
    // Finished.  Terminate the user's program.
    this.executionInfo.queueAction('finish');
    this.executionInfo.terminateWithValue(true);
  }

  return succeeded;
}

/**
 * Certain Maze types - namely, WordSearch, Collector, and any Maze with
 * Quantum maps, don't want to check for success until the user's code
 * has finished running completely.
 */
function shouldCheckSuccessOnMove(this: APIGlobals) {
  if (this.controller.map.hasMultiplePossibleGrids()) {
    return false;
  }
  return 0; //this.resultsHandler.shouldCheckSuccessOnMove();
}

function isPath(this: APIGlobals, direction: number, id: string): boolean {
  const {Direction, SquareType} = this.tiles;

  const effectiveDirection = this.controller.getPegmanD() + direction;
  let square;
  let command;
  switch (this.tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      square = this.controller.map.getTile(
        this.controller.getPegmanY() - 1,
        this.controller.getPegmanX(),
      );
      command = 'look_north';
      break;
    case Direction.EAST:
      square = this.controller.map.getTile(
        this.controller.getPegmanY(),
        this.controller.getPegmanX() + 1,
      );
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = this.controller.map.getTile(
        this.controller.getPegmanY() + 1,
        this.controller.getPegmanX(),
      );
      command = 'look_south';
      break;
    case Direction.WEST:
      square = this.controller.map.getTile(
        this.controller.getPegmanY(),
        this.controller.getPegmanX() - 1,
      );
      command = 'look_west';
      break;
  }
  if (id && command) {
    this.executionInfo.queueAction(command, id);
  }
  return (
    square !== SquareType.WALL &&
    square !== SquareType.OBSTACLE &&
    square !== undefined
  );
}

function move(this: APIGlobals, direction: number, id: string) {
  const {Direction} = this.tiles;

  if (!isPath.bind(this)(direction, '')) {
    this.executionInfo.queueAction(
      'fail_' + (direction ? 'backward' : 'forward'),
      id,
    );
    this.executionInfo.terminateWithValue(false);
    return;
  }
  // If moving backward, flip the effective direction.
  const effectiveDirection = this.controller.getPegmanD() + direction;
  let command;
  const currentPegmanX = this.controller.getPegmanX();
  const currentPegmanY = this.controller.getPegmanY();
  switch (this.tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      this.controller.setPegmanY(currentPegmanY - 1);
      command = 'north';
      break;
    case Direction.EAST:
      this.controller.setPegmanX(currentPegmanX + 1);
      command = 'east';
      break;
    case Direction.SOUTH:
      this.controller.setPegmanY(currentPegmanY + 1);
      command = 'south';
      break;
    case Direction.WEST:
      this.controller.setPegmanX(currentPegmanX - 1);
      command = 'west';
      break;
  }
  if (command) {
    this.executionInfo.queueAction(command, id);
  }
  if (this.controller.subtype.isWordSearch()) {
    (this.controller.subtype as WordSearch).markTileVisited(
      this.controller.getPegmanY(),
      this.controller.getPegmanX(),
      false,
    );
  }
  if (shouldCheckSuccessOnMove.bind(this)()) {
    checkSuccess.bind(this)();
  }
}

/**
 * Turn pegman left or right.
 * @param direction - Direction to turn (0 = left, 1 = right).
 * @param id - ID of block that triggered this action.
 */
function turn(this: APIGlobals, direction: number, id: string) {
  const {TurnDirection} = this.tiles;

  const currentD = this.controller.getPegmanD();
  if (direction === TurnDirection.RIGHT) {
    // Right turn (clockwise).
    this.controller.setPegmanD(currentD + TurnDirection.RIGHT);
    this.executionInfo.queueAction('right', id);
  } else {
    // Left turn (counterclockwise).
    this.controller.setPegmanD(currentD + TurnDirection.LEFT);
    this.executionInfo.queueAction('left', id);
  }
  this.controller.setPegmanD(
    this.tiles.constrainDirection4(this.controller.getPegmanD()),
  );
}

/**
 * Moves the character forward.
 */
export function moveForward(this: APIGlobals, id: string) {
  const {MoveDirection} = this.tiles;

  API_FUNCTION.bind(this)(() => {
    move.bind(this)(MoveDirection.FORWARD, id);
  });
}

/**
 * Moves the character backward.
 */
export function moveBackward(this: APIGlobals, id: string) {
  const {MoveDirection} = this.tiles;

  API_FUNCTION.bind(this)(() => {
    move.bind(this)(MoveDirection.BACKWARD, id);
  });
}

/**
 * Turns the character to their left.
 */
export function turnLeft(this: APIGlobals, id: string) {
  const {TurnDirection} = this.tiles;

  API_FUNCTION.bind(this)(() => {
    turn.bind(this)(TurnDirection.LEFT, id);
  });
}

/**
 * Turns the character to their right.
 */
export function turnRight(this: APIGlobals, id: string) {
  const {TurnDirection} = this.tiles;

  API_FUNCTION.bind(this)(() => {
    turn.bind(this)(TurnDirection.RIGHT, id);
  });
}
