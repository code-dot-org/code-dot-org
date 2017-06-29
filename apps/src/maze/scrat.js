import {SquareType, Direction} from './tiles';
import _ from 'lodash';

import Subtype from './subtype';

const TILE_SHAPES = {
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

export default class Scrat extends Subtype {

  /**
   * @override
   */
  isScrat() {
    return true;
  }

  // Returns true if the tile at x,y is either a water tile or out of bounds
  isWaterOrOutOfBounds(col, row) {
    return this.isWater(col, row) || this.maze_.map.getTile(row, col) === undefined;
  }

  // Returns true if the tile at x,y is a water tile that is in bounds.
  isWater(col, row) {
    return this.maze_.map.getTile(row, col) === SquareType.WALL;
  }

  drawMapTiles(svg) {
    let row, col;

    // first figure out where we want to put the island
    const possibleIslandLocations = [];
    for (row = 0; row < this.maze_.map.ROWS; row++) {
      for (col = 0; col < this.maze_.map.COLS; col++) {
        if (!this.isWater(col, row) || !this.isWater(col + 1, row) ||
          !this.isWater(col, row + 1) || !this.isWater(col + 1, row + 1)) {
          continue;
        }
        possibleIslandLocations.push({row, col});
      }
    }
    const island = _.sample(possibleIslandLocations);
    const preFilled = {};
    if (island) {
      preFilled[`${island.row + 0}_${island.col + 0}`] = 'island_start';
      preFilled[`${island.row + 1}_${island.col + 0}`] = 'island_botLeft';
      preFilled[`${island.row + 0}_${island.col + 1}`] = 'island_topRight';
      preFilled[`${island.row + 1}_${island.col + 1}`] = 'island_botRight';
    }

    let tileId = 0;
    let tile;
    for (row = 0; row < this.maze_.map.ROWS; row++) {
      for (col = 0; col < this.maze_.map.COLS; col++) {
        if (!this.isWaterOrOutOfBounds(col, row)) {
          tile = 'ice';
        } else {
          const adjacentToPath = !this.isWaterOrOutOfBounds(col, row - 1) ||
            !this.isWaterOrOutOfBounds(col + 1, row) ||
            !this.isWaterOrOutOfBounds(col, row + 1) ||
            !this.isWaterOrOutOfBounds(col - 1, row);

          // if next to the path, always just have water. otherwise, there's
          // a chance of one of our other tiles
          tile = 'water';

          tile = preFilled[`${row}_${col}`];
          if (!tile) {
            tile = _.sample(['empty', 'empty', 'empty', 'empty', 'empty', 'lily2',
              'lily3', 'lily4', 'lily5', 'lily1', 'log', 'lily1', 'land1']);
          }

          if (adjacentToPath && tile === 'land1') {
            tile = 'empty';
          }
        }
        this.drawTile(svg, TILE_SHAPES[tile], row, col, tileId);
        tileId++;
      }
    }
  }

  scheduleDance(victoryDance, timeAlloted, skin) {
    const finishIcon = document.getElementById('finish');
    if (finishIcon) {
      finishIcon.setAttribute('visibility', 'hidden');
    }

    const numFrames = skin.celebratePegmanRow;
    const timePerFrame = timeAlloted / numFrames;
    const start = {x: this.maze_.pegmanX, y: this.maze_.pegmanY};

    this.maze_.scheduleSheetedMovement({x: start.x, y: start.y}, {x: 0, y: 0 },
      numFrames, timePerFrame, 'celebrate', Direction.NORTH, true);

    this.studioApp_.playAudio('win');
  }
}
