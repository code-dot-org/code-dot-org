import { SquareType } from './tiles';
import { randomValue } from '../utils';

import Subtype from './subtype';

const TILE_SHAPES = {
  'log':             [0, 0],
  'lily1':           [1, 0],
  'land1':           [2, 0],
  'island_start':    [0, 1],
  'island_topRight': [1, 1],
  'island_botLeft':  [0, 2],
  'island_botRight': [1, 2],
  'water': [0, 4],

  'lily2': [2, 1],
  'lily3': [3, 1],
  'lily4': [2, 2],
  'lily5': [3, 2],

  'ice': [3, 0],
  'cracked_ice': [4, 0],

  'empty': [0, 4]
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

  // Returns true if the tile at x,y is an obstacle tile that is in bounds.
  isObstacle(col, row) {
    return this.maze_.map.getTile(row, col) === SquareType.OBSTACLE;
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
    const island = randomValue(possibleIslandLocations);
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
        if (this.isObstacle(col, row)) {
          tile = 'cracked_ice';
        } else if (!this.isWaterOrOutOfBounds(col, row)) {
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
            tile = randomValue(['empty', 'empty', 'empty', 'empty', 'empty', 'lily2',
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
}
