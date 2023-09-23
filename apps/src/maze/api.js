import {tiles} from '@code-dot-org/maze';
var Direction = tiles.Direction;
var MoveDirection = tiles.MoveDirection;
var TurnDirection = tiles.TurnDirection;
var SquareType = tiles.SquareType;
import {executeIfConditional} from '../utils';

/**
 * Only call API functions if we haven't yet terminated execution
 */
var API_FUNCTION = function (fn) {
  return executeIfConditional(function () {
    return !Maze.executionInfo.isTerminated();
  }, fn);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Maze.move().
 * @return {boolean} True if there is a path.
 */
var isPath = function (direction, id) {
  var effectiveDirection = Maze.controller.getPegmanD() + direction;
  var square;
  var command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      square = Maze.controller.map.getTile(
        Maze.controller.getPegmanY() - 1,
        Maze.controller.getPegmanX()
      );
      command = 'look_north';
      break;
    case Direction.EAST:
      square = Maze.controller.map.getTile(
        Maze.controller.getPegmanY(),
        Maze.controller.getPegmanX() + 1
      );
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = Maze.controller.map.getTile(
        Maze.controller.getPegmanY() + 1,
        Maze.controller.getPegmanX()
      );
      command = 'look_south';
      break;
    case Direction.WEST:
      square = Maze.controller.map.getTile(
        Maze.controller.getPegmanY(),
        Maze.controller.getPegmanX() - 1
      );
      command = 'look_west';
      break;
  }
  if (id) {
    Maze.executionInfo.queueAction(command, id);
  }
  return (
    square !== SquareType.WALL &&
    square !== SquareType.OBSTACLE &&
    square !== undefined
  );
};

/**
 * Attempt to move pegman forward or backward.
 * @param {number} direction Direction to move (0 = forward, 2 = backward).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the end of the maze is reached.
 * @throws {false} If Pegman collides with a wall.
 */
var move = function (direction, id) {
  if (!isPath(direction, null)) {
    Maze.executionInfo.queueAction(
      'fail_' + (direction ? 'backward' : 'forward'),
      id
    );
    Maze.executionInfo.terminateWithValue(false);
    return;
  }
  // If moving backward, flip the effective direction.
  var effectiveDirection = Maze.controller.getPegmanD() + direction;
  var command;
  const currentPegmanX = Maze.controller.getPegmanX();
  const currentPegmanY = Maze.controller.getPegmanY();
  switch (tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      Maze.controller.setPegmanY(currentPegmanY - 1);
      command = 'north';
      break;
    case Direction.EAST:
      Maze.controller.setPegmanX(currentPegmanX + 1);
      command = 'east';
      break;
    case Direction.SOUTH:
      Maze.controller.setPegmanY(currentPegmanY + 1);
      command = 'south';
      break;
    case Direction.WEST:
      Maze.controller.setPegmanX(currentPegmanX - 1);
      command = 'west';
      break;
  }
  Maze.executionInfo.queueAction(command, id);
  if (Maze.controller.subtype.isWordSearch()) {
    Maze.controller.subtype.markTileVisited(
      Maze.controller.getPegmanY(),
      Maze.controller.getPegmanX(),
      false
    );
  }
  if (Maze.shouldCheckSuccessOnMove()) {
    Maze.checkSuccess();
  }
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
var turn = function (direction, id) {
  const currentD = Maze.controller.getPegmanD();
  if (direction === TurnDirection.RIGHT) {
    // Right turn (clockwise).
    Maze.controller.setPegmanD(currentD + TurnDirection.RIGHT);
    Maze.executionInfo.queueAction('right', id);
  } else {
    // Left turn (counterclockwise).
    Maze.controller.setPegmanD(currentD + TurnDirection.LEFT);
    Maze.executionInfo.queueAction('left', id);
  }
  Maze.controller.setPegmanD(
    tiles.constrainDirection4(Maze.controller.getPegmanD())
  );
};

/**
 * Turn pegman towards a given direction, turning through stage front (south)
 * when possible.
 * @param {number} newDirection Direction to turn to (e.g., Direction.NORTH)
 * @param {string} id ID of block that triggered this action.
 */
var turnTo = function (newDirection, id) {
  var currentDirection = Maze.controller.getPegmanD();
  if (isTurnAround(currentDirection, newDirection)) {
    var shouldTurnCWToPreferStageFront = currentDirection - newDirection < 0;
    var relativeTurnDirection = shouldTurnCWToPreferStageFront
      ? TurnDirection.RIGHT
      : TurnDirection.LEFT;
    turn(relativeTurnDirection, id);
    turn(relativeTurnDirection, id);
  } else if (isRightTurn(currentDirection, newDirection)) {
    turn(TurnDirection.RIGHT, id);
  } else if (isLeftTurn(currentDirection, newDirection)) {
    turn(TurnDirection.LEFT, id);
  }
};

function isLeftTurn(direction, newDirection) {
  return (
    newDirection === tiles.constrainDirection4(direction + TurnDirection.LEFT)
  );
}

function isRightTurn(direction, newDirection) {
  return (
    newDirection === tiles.constrainDirection4(direction + TurnDirection.RIGHT)
  );
}

/**
 * Returns whether turning from direction to newDirection would be a 180° turn
 * @param {number} direction
 * @param {number} newDirection
 * @returns {boolean}
 */
function isTurnAround(direction, newDirection) {
  return Math.abs(direction - newDirection) === MoveDirection.BACKWARD;
}

function moveAbsoluteDirection(direction, id) {
  Maze.executionInfo.collectActions();
  turnTo(direction, id);
  move(MoveDirection.FORWARD, id);
  Maze.executionInfo.stopCollecting();
}

export const moveForward = API_FUNCTION(function (id) {
  move(MoveDirection.FORWARD, id);
});

export const moveBackward = API_FUNCTION(function (id) {
  move(MoveDirection.BACKWARD, id);
});

export const moveNorth = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.NORTH, id);
});

export const moveSouth = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.SOUTH, id);
});

export const moveEast = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.EAST, id);
});

export const moveWest = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.WEST, id);
});

export const turnLeft = API_FUNCTION(function (id) {
  turn(TurnDirection.LEFT, id);
});

export const turnRight = API_FUNCTION(function (id) {
  turn(TurnDirection.RIGHT, id);
});

export const isPathForward = API_FUNCTION(function (id) {
  return isPath(MoveDirection.FORWARD, id);
});

export const noPathForward = API_FUNCTION(function (id) {
  return !isPath(MoveDirection.FORWARD, id);
});

export const isPathRight = API_FUNCTION(function (id) {
  return isPath(MoveDirection.RIGHT, id);
});

export const isPathBackward = API_FUNCTION(function (id) {
  return isPath(MoveDirection.BACKWARD, id);
});

export const isPathLeft = API_FUNCTION(function (id) {
  return isPath(MoveDirection.LEFT, id);
});

export const pilePresent = API_FUNCTION(function (id) {
  var x = Maze.controller.getPegmanX();
  var y = Maze.controller.getPegmanY();
  return (
    Maze.controller.map.isDirt(y, x) && Maze.controller.map.getValue(y, x) > 0
  );
});

export const holePresent = API_FUNCTION(function (id) {
  var x = Maze.controller.getPegmanX();
  var y = Maze.controller.getPegmanY();
  return (
    Maze.controller.map.isDirt(y, x) && Maze.controller.map.getValue(y, x) < 0
  );
});

export const currentPositionNotClear = API_FUNCTION(function (id) {
  var x = Maze.controller.getPegmanX();
  var y = Maze.controller.getPegmanY();
  return (
    Maze.controller.map.isDirt(y, x) && Maze.controller.map.getValue(y, x) !== 0
  );
});

export const fill = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('putdown', id);
  var x = Maze.controller.getPegmanX();
  var y = Maze.controller.getPegmanY();
  Maze.controller.map.setValue(y, x, Maze.controller.map.getValue(y, x) + 1);
});

export const dig = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('pickup', id);
  var x = Maze.controller.getPegmanX();
  var y = Maze.controller.getPegmanY();
  Maze.controller.map.setValue(y, x, Maze.controller.map.getValue(y, x) - 1);
});

export const notFinished = API_FUNCTION(function () {
  return !Maze.checkSuccess();
});

// The code for this API should get stripped when showing code
export const loopHighlight = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('null', id);
});

/**
 * Bee related API functions. If better modularized, we could potentially
 * separate these out, but as things stand right now they will be loaded
 * whether or not we're a Bee level
 */
export const getNectar = API_FUNCTION(function (id) {
  if (Maze.controller.subtype.tryGetNectar()) {
    Maze.executionInfo.queueAction('nectar', id);
  }
});

export const makeHoney = API_FUNCTION(function (id) {
  if (Maze.controller.subtype.tryMakeHoney()) {
    Maze.executionInfo.queueAction('honey', id);
  }
});

export const atFlower = API_FUNCTION(function (id) {
  var col = Maze.controller.getPegmanX();
  var row = Maze.controller.getPegmanY();
  Maze.executionInfo.queueAction('at_flower', id);
  return Maze.controller.subtype.isFlower(row, col, true);
});

export const atHoneycomb = API_FUNCTION(function (id) {
  var col = Maze.controller.getPegmanX();
  var row = Maze.controller.getPegmanY();
  Maze.executionInfo.queueAction('at_honeycomb', id);
  return Maze.controller.subtype.isHive(row, col, true);
});

export const nectarRemaining = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('nectar_remaining', id);
  return Maze.controller.subtype.nectarRemaining(true);
});

export const honeyAvailable = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('honey_available', id);
  return Maze.controller.subtype.honeyAvailable();
});

export const nectarCollected = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('nectar_collected', id);
  return Maze.controller.subtype.nectars_.length;
});

export const honeyCreated = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('honey_created', id);
  return Maze.controller.subtype.honey_;
});

/**
 * Harvester
 */

export const getCorn = API_FUNCTION(function (id) {
  if (Maze.controller.subtype.tryGetCorn()) {
    Maze.executionInfo.queueAction('get_corn', id);
  }
});

export const getPumpkin = API_FUNCTION(function (id) {
  if (Maze.controller.subtype.tryGetPumpkin()) {
    Maze.executionInfo.queueAction('get_pumpkin', id);
  }
});

export const getLettuce = API_FUNCTION(function (id) {
  if (Maze.controller.subtype.tryGetLettuce()) {
    Maze.executionInfo.queueAction('get_lettuce', id);
  }
});

export const atCorn = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('at_corn', id);
  return Maze.controller.subtype.atCorn(id);
});

export const atPumpkin = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('at_pumpkin', id);
  return Maze.controller.subtype.atPumpkin(id);
});

export const atLettuce = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('at_lettuce', id);
  return Maze.controller.subtype.atLettuce(id);
});

export const hasCorn = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('has_corn', id);
  return Maze.controller.subtype.hasCorn(id);
});

export const hasPumpkin = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('has_pumpkin', id);
  return Maze.controller.subtype.hasPumpkin(id);
});

export const hasLettuce = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('has_lettuce', id);
  return Maze.controller.subtype.hasLettuce(id);
});

/**
 * Planter
 */

export const plant = API_FUNCTION(function (id) {
  if (Maze.controller.subtype.tryPlant()) {
    Maze.executionInfo.queueAction('plant', id);
  }
});

export const atSoil = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('at_soil', id);
  return Maze.controller.subtype.atSoil(id);
});

export const atSprout = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('at_sprout', id);
  return Maze.controller.subtype.atSprout(id);
});

/**
 * Collector
 */

export const collect = API_FUNCTION(function (id) {
  var col = Maze.controller.getPegmanX();
  var row = Maze.controller.getPegmanY();
  if (Maze.controller.subtype.tryCollect(row, col)) {
    Maze.executionInfo.queueAction('pickup', id);
  } else {
    Maze.executionInfo.queueAction('fail_pickup', id);
  }
});
