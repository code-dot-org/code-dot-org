import {tiles} from '@code-dot-org/maze';

const {Direction, MoveDirection, TurnDirection, SquareType} = tiles;

/**
 * Given two functions, generates a function that returns the result of the
 * second function if and only if the first function returns true
 */
function _executeIfConditional(conditional, fn) {
  return function (...rest) {
    if (conditional()) {
      return fn.apply(this, ...rest);
    }
  };
}

/**
 * Only call API functions if we haven't yet terminated execution
 */
const API_FUNCTION = function (fn, ...rest) {
  if (!this.executionInfo.isTerminated()) {
    fn.apply(this, ...rest);
  }
};

/**
 * Check whether all goals have been accomplished
 */
function checkSuccess() {
  //const succeeded = this.resultsHandler.succeeded();

  if (succeeded) {
    // Finished.  Terminate the user's program.
    this.executionInfo.queueAction('finish', null);
    this.executionInfo.terminateWithValue(true);
  }

  return succeeded;
}

/**
 * Certain Maze types - namely, WordSearch, Collector, and any Maze with
 * Quantum maps, don't want to check for success until the user's code
 * has finished running completely.
 */
function shouldCheckSuccessOnMove() {
  console.log(this);
  if (this.controller.map.hasMultiplePossibleGrids()) {
    return false;
  }
  return 0; //this.resultsHandler.shouldCheckSuccessOnMove();
}

function isPath(direction: number, id: string): boolean {
  const effectiveDirection = this.controller.getPegmanD() + direction;
  console.log(
    'eff',
    effectiveDirection,
    direction,
    this.controller.getPegmanD(),
  );
  let square;
  let command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
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
  if (id) {
    this.executionInfo.queueAction(command, id);
  }
  return (
    square !== SquareType.WALL &&
    square !== SquareType.OBSTACLE &&
    square !== undefined
  );
}

function move(direction: number, id: string) {
  console.log('move!!!!', this, this.executionInfo.queueAction);
  if (!isPath.bind(this)(direction, '')) {
    console.log('fail');
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
  switch (tiles.constrainDirection4(effectiveDirection)) {
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
  const newPegmanX = this.controller.getPegmanX();
  const newPegmanY = this.controller.getPegmanY();
  console.log(
    'move!!!!',
    currentPegmanX,
    currentPegmanY,
    newPegmanX,
    newPegmanY,
  );
  this.executionInfo.queueAction(command, id);
  if (this.controller.subtype.isWordSearch()) {
    this.controller.subtype.markTileVisited(
      this.controller.getPegmanY(),
      this.controller.getPegmanX(),
      false,
    );
  }
  console.log('hmm', this);
  if (shouldCheckSuccessOnMove.bind(this)()) {
    checkSuccess.bind(this)();
  }
}

/**
 * Turn pegman left or right.
 * @param direction - Direction to turn (0 = left, 1 = right).
 * @param id - ID of block that triggered this action.
 */
function turn(direction: number, id: string) {
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
    tiles.constrainDirection4(this.controller.getPegmanD()),
  );
}

export function moveForward(id: string) {
  API_FUNCTION.bind(this)(() => {
    move.bind(this)(MoveDirection.FORWARD, id);
  });
}

export function turnLeft(id: string) {
  API_FUNCTION.bind(this)(() => {
    turn.bind(this)(TurnDirection.LEFT, id);
  });
}

export function turnRight(id: string) {
  API_FUNCTION.bind(this)(() => {
    turn.bind(this)(TurnDirection.RIGHT, id);
  });
}

export function collect() {}
