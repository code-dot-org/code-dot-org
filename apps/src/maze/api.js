var tiles = require('./tiles');
var Direction = tiles.Direction;
var MoveDirection = tiles.MoveDirection;
var TurnDirection = tiles.TurnDirection;
var SquareType = tiles.SquareType;
var utils = require('../utils');
var Bee = require('./bee');

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
var isPath = function(direction, id) {
  var effectiveDirection = Maze.pegmanD + direction;
  var square;
  var command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      square = Maze.map[Maze.pegmanY - 1] &&
          Maze.map[Maze.pegmanY - 1][Maze.pegmanX];
      command = 'look_north';
      break;
    case Direction.EAST:
      square = Maze.map[Maze.pegmanY][Maze.pegmanX + 1];
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = Maze.map[Maze.pegmanY + 1] &&
          Maze.map[Maze.pegmanY + 1][Maze.pegmanX];
      command = 'look_south';
      break;
    case Direction.WEST:
      square = Maze.map[Maze.pegmanY][Maze.pegmanX - 1];
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
var move = function(direction, id) {
  if (!isPath(direction, null)) {
    Maze.executionInfo.queueAction('fail_' + (direction ? 'backward' : 'forward'), id);
    Maze.executionInfo.terminateWithValue(false);
    return;
  }
  // If moving backward, flip the effective direction.
  var effectiveDirection = Maze.pegmanD + direction;
  var command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
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
  if (Maze.wordSearch) {
    Maze.wordSearch.markTileVisited(Maze.pegmanY, Maze.pegmanX, false);
    // wordsearch doesnt check for success until it has finished running completely
    return;
  }
  Maze.checkSuccess();
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
var turn = function(direction, id) {
  if (direction == TurnDirection.RIGHT) {
    // Right turn (clockwise).
    Maze.pegmanD += TurnDirection.RIGHT;
    Maze.executionInfo.queueAction('right', id);
  } else {
    // Left turn (counterclockwise).
    Maze.pegmanD += TurnDirection.LEFT;
    Maze.executionInfo.queueAction('left', id);
  }
  Maze.pegmanD = tiles.constrainDirection4(Maze.pegmanD);
};

/**
 * Turn pegman towards a given direction, turning through stage front (south)
 * when possible.
 * @param {number} newDirection Direction to turn to (e.g., Direction.NORTH)
 * @param {string} id ID of block that triggered this action.
 */
var turnTo = function(newDirection, id) {
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
  return newDirection === tiles.constrainDirection4(direction + TurnDirection.LEFT);
}

function isRightTurn(direction, newDirection) {
  return newDirection === tiles.constrainDirection4(direction + TurnDirection.RIGHT);
}

/**
 * Returns whether turning from direction to newDirection would be a 180° turn
 * @param {number} direction
 * @param {number} newDirection
 * @returns {boolean}
 */
function isTurnAround(direction, newDirection) {
  return Math.abs(direction - newDirection) == MoveDirection.BACKWARD;
}

function moveAbsoluteDirection(direction, id) {
  Maze.executionInfo.collectActions();
  turnTo(direction, id);
  move(MoveDirection.FORWARD, id);
  Maze.executionInfo.stopCollecting();
}

exports.moveForward = API_FUNCTION(function(id) {
  move(MoveDirection.FORWARD, id);
});

exports.moveBackward = API_FUNCTION(function(id) {
  move(MoveDirection.BACKWARD, id);
});

exports.moveNorth = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.NORTH, id);
});

exports.moveSouth = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.SOUTH, id);
});

exports.moveEast = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.EAST, id);
});

exports.moveWest = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.WEST, id);
});

exports.turnLeft = API_FUNCTION(function(id) {
  turn(TurnDirection.LEFT, id);
});

exports.turnRight = API_FUNCTION(function(id) {
  turn(TurnDirection.RIGHT, id);
});

exports.isPathForward = API_FUNCTION(function(id) {
  return isPath(MoveDirection.FORWARD, id);
});
exports.noPathForward = API_FUNCTION(function(id) {
  return !isPath(MoveDirection.FORWARD, id);
});

exports.isPathRight = API_FUNCTION(function(id) {
  return isPath(MoveDirection.RIGHT, id);
});

exports.isPathBackward = API_FUNCTION(function(id) {
  return isPath(MoveDirection.BACKWARD, id);
});

exports.isPathLeft = API_FUNCTION(function(id) {
  return isPath(MoveDirection.LEFT, id);
});

exports.pilePresent = API_FUNCTION(function(id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] > 0;
});

exports.holePresent = API_FUNCTION(function(id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] < 0;
});

exports.currentPositionNotClear = API_FUNCTION(function(id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] !== 0;
});

exports.fill = API_FUNCTION(function(id) {
  Maze.executionInfo.queueAction('putdown', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.dirt_[y][x] = Maze.dirt_[y][x] + 1;
});

exports.dig = API_FUNCTION(function(id) {
  Maze.executionInfo.queueAction('pickup', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.dirt_[y][x] = Maze.dirt_[y][x] - 1;
});

exports.notFinished = API_FUNCTION(function() {
  return !Maze.checkSuccess();
});

// The code for this API should get stripped when showing code
exports.loopHighlight = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('null', id);
});


for (var functionName in Bee.api) {
  exports[functionName] = API_FUNCTION(Bee.api[functionName]);
}
