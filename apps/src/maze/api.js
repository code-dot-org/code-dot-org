import {
  Direction,
  MoveDirection,
  TurnDirection,
  SquareType,
  constrainDirection4,
} from './tiles';
import * as utils from '../utils';

/**
 * Only call API functions if we haven't yet terminated execution
 */
var API_FUNCTION = function (fn) {
  return utils.executeIfConditional(function () {
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
  var effectiveDirection = Maze.pegmanD + direction;
  var square;
  var command;
  switch (constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      square = Maze.map.getTile(Maze.pegmanY - 1, Maze.pegmanX);
      command = 'look_north';
      break;
    case Direction.EAST:
      square = Maze.map.getTile(Maze.pegmanY, Maze.pegmanX + 1);
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = Maze.map.getTile(Maze.pegmanY + 1, Maze.pegmanX);
      command = 'look_south';
      break;
    case Direction.WEST:
      square = Maze.map.getTile(Maze.pegmanY, Maze.pegmanX - 1);
      command = 'look_west';
      break;
  }
  if (id) {
    Maze.executionInfo.queueAction(command, id);
  }
  return square !== SquareType.WALL &&
        square !== SquareType.OBSTACLE &&
        square !== undefined;
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
    Maze.executionInfo.queueAction('fail_' + (direction ? 'backward' : 'forward'), id);
    Maze.executionInfo.terminateWithValue(false);
    return;
  }
  // If moving backward, flip the effective direction.
  var effectiveDirection = Maze.pegmanD + direction;
  var command;
  switch (constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      Maze.pegmanY--;
      command = 'north';
      break;
    case Direction.EAST:
      Maze.pegmanX++;
      command = 'east';
      break;
    case Direction.SOUTH:
      Maze.pegmanY++;
      command = 'south';
      break;
    case Direction.WEST:
      Maze.pegmanX--;
      command = 'west';
      break;
  }
  Maze.executionInfo.queueAction(command, id);
  if (Maze.subtype.isWordSearch()) {
    Maze.subtype.markTileVisited(Maze.pegmanY, Maze.pegmanX, false);
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
  if (direction === TurnDirection.RIGHT) {
    // Right turn (clockwise).
    Maze.pegmanD += TurnDirection.RIGHT;
    Maze.executionInfo.queueAction('right', id);
  } else {
    // Left turn (counterclockwise).
    Maze.pegmanD += TurnDirection.LEFT;
    Maze.executionInfo.queueAction('left', id);
  }
  Maze.pegmanD = constrainDirection4(Maze.pegmanD);
};

/**
 * Turn pegman towards a given direction, turning through stage front (south)
 * when possible.
 * @param {number} newDirection Direction to turn to (e.g., Direction.NORTH)
 * @param {string} id ID of block that triggered this action.
 */
var turnTo = function (newDirection, id) {
  var currentDirection = Maze.pegmanD;
  if (isTurnAround(currentDirection, newDirection)) {
    var shouldTurnCWToPreferStageFront = currentDirection - newDirection < 0;
    var relativeTurnDirection = shouldTurnCWToPreferStageFront ? TurnDirection.RIGHT : TurnDirection.LEFT;
    turn(relativeTurnDirection, id);
    turn(relativeTurnDirection, id);
  } else if (isRightTurn(currentDirection, newDirection)) {
    turn(TurnDirection.RIGHT, id);
  } else if (isLeftTurn(currentDirection, newDirection)) {
    turn(TurnDirection.LEFT, id);
  }
};

function isLeftTurn(direction, newDirection) {
  return newDirection === constrainDirection4(direction + TurnDirection.LEFT);
}

function isRightTurn(direction, newDirection) {
  return newDirection === constrainDirection4(direction + TurnDirection.RIGHT);
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

export var moveForward = API_FUNCTION(function (id) {
  move(MoveDirection.FORWARD, id);
});

export var moveBackward = API_FUNCTION(function (id) {
  move(MoveDirection.BACKWARD, id);
});

export var moveNorth = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.NORTH, id);
});

export var moveSouth = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.SOUTH, id);
});

export var moveEast = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.EAST, id);
});

export var moveWest = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.WEST, id);
});

export var turnLeft = API_FUNCTION(function (id) {
  turn(TurnDirection.LEFT, id);
});

export var turnRight = API_FUNCTION(function (id) {
  turn(TurnDirection.RIGHT, id);
});

export var isPathForward = API_FUNCTION(function (id) {
  return isPath(MoveDirection.FORWARD, id);
});

export var noPathForward = API_FUNCTION(function (id) {
  return !isPath(MoveDirection.FORWARD, id);
});

export var isPathRight = API_FUNCTION(function (id) {
  return isPath(MoveDirection.RIGHT, id);
});

export var isPathBackward = API_FUNCTION(function (id) {
  return isPath(MoveDirection.BACKWARD, id);
});

export var isPathLeft = API_FUNCTION(function (id) {
  return isPath(MoveDirection.LEFT, id);
});

export var pilePresent = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.map.isDirt(y, x) && Maze.map.getValue(y, x) > 0;
});

export var holePresent = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.map.isDirt(y, x) && Maze.map.getValue(y, x) < 0;
});

export var currentPositionNotClear = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.map.isDirt(y, x) && Maze.map.getValue(y, x) !== 0;
});

export var fill = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('putdown', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.map.setValue(y, x, Maze.map.getValue(y, x) + 1);
});

export var dig = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('pickup', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.map.setValue(y, x, Maze.map.getValue(y, x) - 1);
});

export var notFinished = API_FUNCTION(function () {
  return !Maze.checkSuccess();
});

// The code for this API should get stripped when showing code
export var loopHighlight = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('null', id);
});

/**
 * Bee related API functions. If better modularized, we could potentially
 * separate these out, but as things stand right now they will be loaded
 * whether or not we're a Bee level
 */
export var getNectar = API_FUNCTION(function (id) {
  Maze.subtype.getNectar(id);
});

export var makeHoney = API_FUNCTION(function (id) {
  Maze.subtype.makeHoney(id);
});

export var atFlower = API_FUNCTION(function (id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.executionInfo.queueAction("at_flower", id);
  return Maze.subtype.isFlower(row, col, true);
});

export var atHoneycomb = API_FUNCTION(function (id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.executionInfo.queueAction("at_honeycomb", id);
  return Maze.subtype.isHive(row, col, true);
});

export var nectarRemaining = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("nectar_remaining", id);
  return Maze.subtype.nectarRemaining(true);
});

export var honeyAvailable = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("honey_available", id);
  return Maze.subtype.honeyAvailable();
});

export var nectarCollected = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("nectar_collected", id);
  return Maze.subtype.nectars_.length;
});

export var honeyCreated = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("honey_created", id);
  return Maze.subtype.honey_;
});

/**
 * Harvester
 */

export var getCorn = API_FUNCTION(function (id) {
  Maze.subtype.getCorn(id);
});

export var getPumpkin = API_FUNCTION(function (id) {
  Maze.subtype.getPumpkin(id);
});

export var getLettuce = API_FUNCTION(function (id) {
  Maze.subtype.getLettuce(id);
});

export var atCorn = API_FUNCTION(function (id) {
  return Maze.subtype.atCorn(id);
});

export var atPumpkin = API_FUNCTION(function (id) {
  return Maze.subtype.atPumpkin(id);
});

export var atLettuce = API_FUNCTION(function (id) {
  return Maze.subtype.atLettuce(id);
});

export var hasCorn = API_FUNCTION(function (id) {
  return Maze.subtype.hasCorn(id);
});

export var hasPumpkin = API_FUNCTION(function (id) {
  return Maze.subtype.hasPumpkin(id);
});

export var hasLettuce = API_FUNCTION(function (id) {
  return Maze.subtype.hasLettuce(id);
});

/**
 * Planter
 */

export var plant = API_FUNCTION(function (id) {
  Maze.subtype.plant(id);
});

export var atSoil = API_FUNCTION(function (id) {
  return Maze.subtype.atSoil(id);
});

export var atSprout = API_FUNCTION(function (id) {
  return Maze.subtype.atSprout(id);
});

/**
 * Collector
 */

export var collect = API_FUNCTION(function (id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.subtype.collect(id, row, col);
});
