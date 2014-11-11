var SquareType = require('./tiles').SquareType;
var utils = require('../utils');
var _ = utils.getLodash();

var TILE_SHAPES = {
  'log':             [0, 0],
  'lily1':           [1, 0],
  'land1':           [2, 0],
  'island_start':    [0, 1],
  'island_topRight': [1, 1],
  'island_botLeft':  [0, 2],
  'island_botRight': [1, 2],
  'water': [4, 0],

  'lily2': [2, 1],
  'lily3': [3, 1],
  'lily4': [2, 2],
  'lily5': [3, 2],

  'ice': [3, 0],

  'empty': [4, 0]
};

// Returns true if the tile at x,y is either a wall or out of bounds
function isWallOrOutOfBounds (x, y) {
  return Maze.map[y] === undefined || Maze.map[y][x] === undefined ||
    Maze.map[y][x] === SquareType.WALL;
}

// Returns true if the tile at x,y is a wall that is in bounds.
function isWall (x, y) {
  return Maze.map[y] !== undefined && Maze.map[y][x] === SquareType.WALL;
}

/**
 * Override maze's drawMapTiles
 */
module.exports.drawMapTiles = function (svg) {
  var island = null;

  var tileId = 0;
  var tile;
  for (var row = 0; row < Maze.ROWS; row++) {
    for (var col = 0; col < Maze.COLS; col++) {
      if (!isWallOrOutOfBounds(col, row)) {
        tile = 'ice';
      } else {
        var adjacentToPath = !isWallOrOutOfBounds(col, row - 1) ||
          !isWallOrOutOfBounds(col + 1, row) ||
          !isWallOrOutOfBounds(col, row + 1) ||
          !isWallOrOutOfBounds(col - 1, row);

        // if next to the path, always just have water. otherwise, there's
        // a chance of one of our other tiles
        tile = 'water';
        tile = _.sample(['empty', 'empty', 'empty', 'empty', 'empty', 'lily2',
          'lily3', 'lily4', 'lily5', 'lily1', 'log', 'lily1', 'land1']);

        if (island !== null) {
          if (island.col === col - 1 && island.row === row) {
            tile = 'island_topRight';
          } else  if (island.col === col && island.row === row - 1) {
            tile = 'island_botLeft';
          } else  if (island.col === col - 1 && island.row === row - 1) {
            tile = 'island_botRight';
          }
        } else if (Math.random() < 1/20 &&
            isWall(col + 1, row + 0) && isWallOrOutOfBounds(col + 2, row) &&
            isWall(col + 0, row + 1) && isWallOrOutOfBounds(col, row + 2) &&
            isWall(col + 1, row + 1)) {
          island = { col: col, row: row};
          tile = 'island_start';
        }

        if (adjacentToPath && tile === 'land1') {
          tile = 'empty';
        }
      }
      Maze.drawTile(svg, TILE_SHAPES[tile], row, col, tileId);
      tileId++;
    }
  }
};

/**
 * Schedule the animations for Scrat dancing.
 * @param {integer} timeAlloted How much time we have for our animations
 */
module.exports.scheduleDance = function (victoryDance, timeAlloted) {
  var finishIcon = document.getElementById('finish');
  if (finishIcon) {
    finishIcon.setAttribute('visibility', 'hidden');
  }

  var numFrames = skin.celebratePegmanRow;
  var timePerFrame = timeAlloted / numFrames;
  var start = {x: Maze.pegmanX, y: Maze.pegmanY};

  scheduleSheetedMovement({x: start.x, y: start.y}, {x: 0, y: 0 },
    numFrames, timePerFrame, 'celebrate', Direction.NORTH, true);
};
