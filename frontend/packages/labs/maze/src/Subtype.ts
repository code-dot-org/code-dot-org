import {EventEmitter} from 'events';

import Cell, {type CellConstructor} from './Cell';
import DirtDrawer from './DirtDrawer';
import Drawer from './Drawer';
import type MazeController from './MazeController';
import type {MazeData} from './MazeController';
import type {Skin} from './skin';
import {SquareType} from './tiles';

export interface SubtypeConfiguration {
  skin: Skin;
  level: MazeData;
}

export type SubtypeConstructor<T extends Cell, U extends Drawer<T>> = new (
  maze: MazeController,
  options: SubtypeConfiguration,
) => Subtype<T, U>;

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
export const TILE_SHAPES: {
  [key: string]: [number, number];
} = {
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
  null0: [4, 3], // Empty
  null1: [3, 0],
  null2: [3, 1],
  null3: [0, 3],
  null4: [1, 3],
};

export interface Point {
  x: number;
  y: number;
}

// Chance of showing a random wall tile other than the default.
const RANDOM_TILE_RATE = 0.2;

class Subtype<T extends Cell, U extends Drawer<T>> extends EventEmitter {
  maze_: MazeController;
  skin_: Skin;
  drawer_?: Drawer<T>;
  wallMap?: number[][];

  startDirection: number;
  start?: Point;
  finish?: Point;

  get drawer(): U {
    return this.drawer_ as U;
  }

  set drawer(value: U) {
    this.drawer_ = value as Drawer<T>;
  }

  constructor(maze: MazeController, {skin, level}: SubtypeConfiguration) {
    super();

    this.maze_ = maze;
    this.skin_ = skin;
    this.startDirection = level?.startDirection || 0;
  }

  getValue(row: number, col: number): number | undefined {
    return this.getCell(row, col)?.getCurrentValue();
  }

  setValue(row: number, col: number, val: number) {
    this.getCell(row, col)?.setCurrentValue(val);
  }

  getCell(row: number, col: number): Cell | undefined {
    return this.maze_.map?.currentStaticGrid?.[row]?.[col];
  }

  getCellClass(): CellConstructor {
    return Cell;
  }

  /**
   * Load subtype-specific audio; called by Maze.init
   */
  loadAudio(_skin: Skin) {
    // noop; overridable
  }

  /**
   * Simple safe passthrough to StudioApp.playAudio
   * @param sound - string key of sound to play, as defined by loadAudio
   */
  playAudio_(sound: string) {
    this.maze_.playAudio(sound);
  }

  /**
   * Creates the generic drawer.
   */
  createDrawer(svg: SVGSVGElement) {
    if (this.maze_.map) {
      this.drawer = new DirtDrawer(
        this.maze_.map,
        this.skin_.dirt || '',
        svg,
      ) as U;
    }
  }

  /**
   * @fires reset
   */
  reset() {
    this.emit('reset');
  }

  isFarmer(): boolean {
    return false;
  }

  isCollector(): boolean {
    return false;
  }

  isScrat(): boolean {
    return false;
  }

  isWordSearch(): boolean {
    return false;
  }

  isBee(): boolean {
    return false;
  }

  isNeighborhood(): boolean {
    return false;
  }

  // Return a value of '0' if the specified square is wall or out of bounds '1'
  // otherwise (empty, obstacle, start, finish).
  isOnPathStr_(x: number, y: number): '0' | '1' {
    return this.isWallOrOutOfBounds_(x, y) ? '0' : '1';
  }

  // Returns true if the tile at x,y is either a wall or out of bounds
  isWallOrOutOfBounds_(col: number, row: number): boolean {
    return (
      this.maze_.map?.getTile(row, col) === SquareType.WALL ||
      this.maze_.map?.getTile(row, col) === undefined
    );
  }

  getEmptyTile(
    x: number,
    y: number,
    adjacentToPath: boolean = false,
    innerCorner: boolean = false,
  ): string {
    let tile;

    // Empty square.  Use null0 for large areas, with null1-4 for borders.
    if (innerCorner || (!adjacentToPath && Math.random() > RANDOM_TILE_RATE)) {
      if (this.wallMap?.[y]) {
        this.wallMap[y][x] = 0;
      }
      tile = 'null0';
    } else {
      const wallIdx = Math.floor(1 + Math.random() * 4);
      if (this.wallMap?.[y]) {
        this.wallMap[y][x] = wallIdx;
      }
      tile = 'null' + wallIdx;
    }

    return tile;
  }

  /**
   * Draw the tiles making up the maze map.
   */
  drawMapTiles(svg: SVGSVGElement) {
    // Compute and draw the tile for each square.
    let tileId = 0;
    let tile;
    this.maze_.map?.forEachCell((_cell, row, col) => {
      // Compute the tile index.
      tile =
        this.isOnPathStr_(col, row) +
        this.isOnPathStr_(col, row - 1) + // North.
        this.isOnPathStr_(col + 1, row) + // West.
        this.isOnPathStr_(col, row + 1) + // South.
        this.isOnPathStr_(col - 1, row); // East.

      // Draw the tile.
      if (!TILE_SHAPES[tile]) {
        const adjacentToPath = tile !== '00000';
        // Any block with 2, 3 or 4 orthogonal paths.
        const innerCorner = adjacentToPath && tile.split('1').length > 2;

        // We have an empty square. Handle it differently based on skin.
        tile = this.getEmptyTile(col, row, adjacentToPath, innerCorner);
      }

      this.drawTile(svg, TILE_SHAPES[tile], row, col, tileId);
      this.drawer.updateItemImage(row, col, false);

      tileId++;
    });
  }

  /**
   * Draw the given tile at row, col
   */
  drawTile(
    svg: SVGSVGElement,
    tileSheetLocation: [number, number],
    row: number,
    col: number,
    tileId: string | number,
  ) {
    this.drawer.drawTile(
      svg,
      tileSheetLocation,
      row,
      col,
      tileId,
      this.skin_.tiles || '',
    );
  }

  scheduleDirtChange(row: number, col: number) {
    this.drawer.updateItemImage(row, col, true);
  }

  /**
   * Initialize the wallMap.  For any cell at location x,y Maze.wallMap[y][x] will
   * be the index of which wall tile to use for that cell.  If the cell is not a
   * wall, Maze.wallMap[y][x] is undefined.
   */
  initWallMap() {
    if (this.maze_.map) {
      this.wallMap = new Array(this.maze_.map.ROWS);
      for (let y = 0; y < this.maze_.map.ROWS; y++) {
        this.wallMap[y] = new Array(this.maze_.map.COLS);
      }
    }
  }

  initStartFinish() {
    this.start = undefined;
    this.finish = undefined;

    // Locate the start and finish squares.
    for (let y = 0; y < (this.maze_.map?.ROWS || 0); y++) {
      for (let x = 0; x < (this.maze_.map?.COLS || 0); x++) {
        const cell = this.maze_.map?.getTile(y, x);
        if (cell === SquareType.START) {
          this.start = {x, y};
        } else if (cell === SquareType.FINISH) {
          this.finish = {x, y};
        } else if (cell === SquareType.STARTANDFINISH) {
          this.start = {x, y};
          this.finish = {x, y};
        }
      }
    }
  }

  // Whether this subype supports multiple pegmen or not. Default false.
  allowMultiplePegmen(): boolean {
    return false;
  }

  /**
   * When this returns true, this reset all tiles already. When this returns
   * false, the controller is meant to do it themselves.
   */
  resetTiles(): boolean {
    // We aren't controlling resetting tiles
    // So the controller should do it.
    return false;
  }
}

export default Subtype;
