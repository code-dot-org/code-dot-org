var SquareType = require('./tiles').SquareType;
var Direction = require('./tiles').Direction;
var utils = require('../utils');
var _ = utils.getLodash();
var studioApp = require('../StudioApp').singleton;

var TILE_SHAPES = {
  'log': [0, 0],
  'lily1': [1, 0],
  'land1': [2, 0],
  'island_start': [0, 1],
  'island_topRight': [1, 1],
  'island_botLeft': [0, 2],
  'island_botRight': [1, 2],
  'water': [4, 0],

  'lily2': [2, 1],
  'lily3': [3, 1],
  'lily4': [2, 2],
  'lily5': [3, 2],

  'ice': [3, 0],

  'empty': [4, 0]
};

// Returns true if the tile at x,y is either a water tile or out of bounds
function isWaterOrOutOfBounds (col, row) {
  return Maze.map.getTile(row, col) === SquareType.WALL ||
      Maze.map.getTile(row, col) === undefined;
}

// Returns true if the tile at x,y is a water tile that is in bounds.
function isWater (col, row) {
  return Maze.map.getTile(row, col) === SquareType.WALL;
}

/**
 * Override maze's drawMapTiles
 */
module.exports.drawMapTiles = function (svg) {
  var row, col;

  // first figure out where we want to put the island
  var possibleIslandLocations = [];
  for (row = 0; row < Maze.map.ROWS; row++) {
    for (col = 0; col < Maze.map.COLS; col++) {
      if (!isWater(col, row) || !isWater(col + 1, row) ||
        !isWater(col, row + 1) || !isWater(col + 1, row + 1)) {
        continue;
      }
      possibleIslandLocations.push({row: row, col: col});
    }
  }
  var island = _.sample(possibleIslandLocations);
  var preFilled = {};
  if (island) {
    preFilled[(island.row + 0) + "_" + (island.col + 0)] = 'island_start';
    preFilled[(island.row + 1) + "_" + (island.col + 0)] = 'island_botLeft';
    preFilled[(island.row + 0) + "_" + (island.col + 1)] = 'island_topRight';
    preFilled[(island.row + 1) + "_" + (island.col + 1)] = 'island_botRight';
  }

  var tileId = 0;
  var tile;
  for (row = 0; row < Maze.map.ROWS; row++) {
    for (col = 0; col < Maze.map.COLS; col++) {
      if (!isWaterOrOutOfBounds(col, row)) {
        tile = 'ice';
      } else {
        var adjacentToPath = !isWaterOrOutOfBounds(col, row - 1) ||
          !isWaterOrOutOfBounds(col + 1, row) ||
          !isWaterOrOutOfBounds(col, row + 1) ||
          !isWaterOrOutOfBounds(col - 1, row);

        // if next to the path, always just have water. otherwise, there's
        // a chance of one of our other tiles
        tile = 'water';

        tile = preFilled[row + "_" + col];
        if (!tile) {
          tile = _.sample(['empty', 'empty', 'empty', 'empty', 'empty', 'lily2',
            'lily3', 'lily4', 'lily5', 'lily1', 'log', 'lily1', 'land1']);
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
module.exports.scheduleDance = function (victoryDance, timeAlloted, skin) {
  var finishIcon = document.getElementById('finish');
  if (finishIcon) {
    finishIcon.setAttribute('visibility', 'hidden');
  }

  var numFrames = skin.celebratePegmanRow;
  var timePerFrame = timeAlloted / numFrames;
  var start = {x: Maze.pegmanX, y: Maze.pegmanY};

  Maze.scheduleSheetedMovement({x: start.x, y: start.y}, {x: 0, y: 0},
    numFrames, timePerFrame, 'celebrate', Direction.NORTH, true);

  studioApp.playAudio('win');
};
