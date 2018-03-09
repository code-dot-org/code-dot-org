import Cell from './cell';
import DirtDrawer from './dirtDrawer';

import { SquareType } from './tiles';
import { EventEmitter } from 'events'; // provided by webpack's node-libs-browser

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
const TILE_SHAPES = {
  '10010': [4, 0], // Dead ends
  '10001': [3, 3],
  '11000': [0, 1],
  '10100': [0, 2],
  '11010': [4, 1], // Vertical
  '10101': [3, 2], // Horizontal
  '10110': [0, 0], // Elbows
  '10011': [2, 0],
  '11001': [4, 2],
  '11100': [2, 3],
  '11110': [1, 1], // Junctions
  '10111': [1, 0],
  '11011': [2, 1],
  '11101': [1, 2],
  '11111': [2, 2], // Cross
  'null0': [4, 3], // Empty
  'null1': [3, 0],
  'null2': [3, 1],
  'null3': [0, 3],
  'null4': [1, 3],
};

export default class Subtype extends EventEmitter {
  constructor(maze, config) {
    super();

    this.maze_ = maze;
    this.skin_ = config.skin;
    this.level_ = config.level;
    this.startDirection = config.level.startDirection;
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @returns {Number} val
   */
  getValue(row, col) {
    return this.getCell(row, col).getCurrentValue();
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @param {Number} val
   */
  setValue(row, col, val) {
    this.getCell(row, col).setCurrentValue(val);
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @returns {Object} cell
   */
  getCell(row, col) {
    return this.maze_.map.currentStaticGrid[row][col];
  }

  getCellClass() {
    return Cell;
  }

  /**
   * Load subtype-specific audio; called by Maze.init
   *
   * @param {Object} skin
   */
  loadAudio(skin) {
    // noop; overridable
  }

  /**
   * Simple safe passthrough to StudioApp.playAudio
   * @param {String} sound - string key of sound to play, as defined by
   *    StudioApp.loadAudio
   */
  playAudio_(sound) {
    // Check for StudioApp, which will often be undefined in unit tests
    if (this.maze_.playAudio) {
      this.maze_.playAudio(sound);
    }
  }

  createDrawer(svg) {
    this.drawer = new DirtDrawer(this.maze_.map, this.skin_.dirt, svg);
  }

  /**
   * @fires reset
   */
  reset() {
    this.emit('reset');
  }

  isFarmer() {
    return false;
  }

  isCollector() {
    return false;
  }

  isScrat() {
    return false;
  }

  isWordSearch() {
    return false;
  }

  isBee() {
    return false;
  }

  // Return a value of '0' if the specified square is wall or out of bounds '1'
  // otherwise (empty, obstacle, start, finish).
  isOnPathStr_(x, y) {
    return this.isWallOrOutOfBounds_(x, y) ? "0" : "1";
  }

  // Returns true if the tile at x,y is either a wall or out of bounds
  isWallOrOutOfBounds_(col, row) {
    return (
      this.maze_.map.getTile(row, col) === SquareType.WALL ||
      this.maze_.map.getTile(row, col) === undefined
    );
  }

  getEmptyTile(x, y, adjacentToPath) {
    let tile;
    // Empty square.  Use null0 for large areas, with null1-4 for borders.
    if (!adjacentToPath && Math.random() > 0.3) {
      this.wallMap[y][x] = 0;
      tile = 'null0';
    } else {
      const wallIdx = Math.floor(1 + Math.random() * 4);
      this.wallMap[y][x] = wallIdx;
      tile = 'null' + wallIdx;
    }

    // For the first 3 levels in maze, only show the null0 image.
    if (['2_1', '2_2', '2_3'].includes(this.level_.id)) {
      this.wallMap[y][x] = 0;
      tile = 'null0';
    }
    return tile;
  }

  /**
   * Draw the tiles making up the maze map.
   */
  drawMapTiles(svg) {
    // Compute and draw the tile for each square.
    let tileId = 0;
    let tile;
    this.maze_.map.forEachCell((cell, row, col) => {
      // Compute the tile index.
      tile = this.isOnPathStr_(col, row) +
        this.isOnPathStr_(col, row - 1) + // North.
        this.isOnPathStr_(col + 1, row) + // West.
        this.isOnPathStr_(col, row + 1) + // South.
        this.isOnPathStr_(col - 1, row); // East.

      const adjacentToPath = (tile !== '00000');

      // Draw the tile.
      if (!TILE_SHAPES[tile]) {
        // We have an empty square. Handle it differently based on skin.
        tile = this.getEmptyTile(col, row, adjacentToPath);
      }

      this.drawTile(svg, TILE_SHAPES[tile], row, col, tileId);
      this.drawer.updateItemImage(row, col, false);

      tileId++;
    });
  }

  scheduleDirtChange(row, col) {
    this.drawer.updateItemImage(row, col, true);
  }

  /**
   * Draw the given tile at row, col
   */
  drawTile(svg, tileSheetLocation, row, col, tileId) {
    this.drawer.drawTile(
      svg,
      tileSheetLocation,
      row,
      col,
      tileId,
      this.skin_.tiles,
    );
  }

  /**
   * Initialize the wallMap.  For any cell at location x,y Maze.wallMap[y][x] will
   * be the index of which wall tile to use for that cell.  If the cell is not a
   * wall, Maze.wallMap[y][x] is undefined.
   */
  initWallMap() {
    this.wallMap = new Array(this.maze_.map.ROWS);
    for (let y = 0; y < this.maze_.map.ROWS; y++) {
      this.wallMap[y] = new Array(this.maze_.map.COLS);
    }
  }

  initStartFinish() {
    this.start = undefined;
    this.finish = undefined;

    // Locate the start and finish squares.
    for (let y = 0; y < this.maze_.map.ROWS; y++) {
      for (let x = 0; x < this.maze_.map.COLS; x++) {
        let cell = this.maze_.map.getTile(y, x);
        if (cell === SquareType.START) {
          this.start = { x, y };
        } else if (cell === SquareType.FINISH) {
          this.finish = { x, y };
        } else if (cell === SquareType.STARTANDFINISH) {
          this.start = { x, y };
          this.finish = { x, y };
        }
      }
    }
  }
}
