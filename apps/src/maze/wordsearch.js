import Subtype from './subtype';
import WordSearchDrawer from './wordsearchDrawer';
import { SquareType } from './tiles';
import { randomValue } from '../utils';

/**
 * Create a new WordSearch.
 */
export default class WordSearch extends Subtype {
  constructor(maze, config) {
    super(maze, config);
    this.goal_ = config.level.searchWord;
    this.visited_ = '';
    this.map_ = config.level.map;
  }

  getVisited() {
    return this.visited_;
  }

  /**
   * @override
   */
  isWordSearch() {
    return true;
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new WordSearchDrawer(this.maze_.map, '', svg);
  }

  /**
   * Returns true if the given row,col is both on the grid and not a wall
   */
  isOpen_(row, col) {
    const map = this.map_;
    return ((map[row] !== undefined) &&
      (map[row][col] !== undefined) &&
      (map[row][col] !== SquareType.WALL));
  }

  /**
   * Given a row and col, returns the row, col pair of any non-wall neighbors
   */
  openNeighbors_(row, col) {
    const neighbors = [];
    if (this.isOpen_(row + 1, col)) {
      neighbors.push([row + 1, col]);
    }
    if (this.isOpen_(row - 1, col)) {
      neighbors.push([row - 1, col]);
    }
    if (this.isOpen_(row, col + 1)) {
      neighbors.push([row, col + 1]);
    }
    if (this.isOpen_(row, col - 1)) {
      neighbors.push([row, col - 1]);
    }

    return neighbors;
  }

  /**
   * We never want to have a branch where either direction gets you the next
   * correct letter.  As such, a "wall" space should never have the same value as
   * an open neighbor of an neighbor (i.e. if my non-wall neighbor has a non-wall
   * neighbor whose value is E, I can't also be E)
   */
  restrictedValues_(row, col) {
    const map = this.map_;
    const neighbors = this.openNeighbors_(row, col);
    const values = [];
    for (let i = 0; i < neighbors.length; i ++) {
      const secondNeighbors = this.openNeighbors_(neighbors[i][0], neighbors[i][1]);
      for (let j = 0; j < secondNeighbors.length; j++) {
        const neighborRow = secondNeighbors[j][0];
        const neighborCol = secondNeighbors[j][1];
        // push value to restricted list
        const val = WordSearch.letterValue(map[neighborRow][neighborCol], false);
        values.push(val, false);
      }
    }
    return values;
  }

  /**
   * Generate random tiles for walls (with some restrictions) and draw them to
   * the svg.
   * @override
   */
  drawMapTiles(svg) {
    let letter;
    let restricted;

    for (let row = 0; row < this.map_.length; row++) {
      for (let col = 0; col < this.map_[row].length; col++) {
        const mapVal = this.map_[row][col];
        if (mapVal === WordSearch.EMPTY_CHAR) {
          restricted = this.restrictedValues_(row, col);
          letter = WordSearch.randomLetter(restricted);
        } else {
          letter = WordSearch.letterValue(mapVal, true);
        }

        this.drawTile(svg, letter, row, col);
      }
    }
  }

  /**
   * Reset all tiles to beginning state
   * @override
   */
  resetTiles() {
    for (let row = 0; row < this.map_.length; row++) {
      for (let col = 0; col < this.map_[row].length; col++) {
        this.drawer.updateTileHighlight(row, col, false);
      }
    }
    document.getElementById('currentWordContents').textContent = '';
    this.visited_ = '';
  }

  /**
   * Mark that we've visited a tile
   * @param {number} row Row visited
   * @param {number} col Column visited
   * @param {boolean} animating True if this is while animating
   */
  markTileVisited(row, col, animating) {
    const letterCell = document.getElementById(WordSearchDrawer.cellId('letter', row, col));
    this.visited_ += letterCell.textContent;

    if (animating) {
      this.drawer.updateTileHighlight(row, col, true);
      document.getElementById('currentWordContents').textContent = this.visited_;
    }
  }

}

WordSearch.START_CHAR = '-';
WordSearch.EMPTY_CHAR = '_';
WordSearch.ALL_CHARS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
  "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

/**
 * For wordsearch, values in Maze.map can take the form of a number (i.e. 2 means
 * start), a letter ('A' means A), or a letter followed by x ('Nx' means N and
 * that this is the finish.  This function will strip the x, and will convert
 * number values to WordSearch.START_CHAR
 */
WordSearch.letterValue = function (val) {
  if (typeof(val) === "number") {
    return WordSearch.START_CHAR;
  }

  if (typeof(val) === "string") {
    // temporary hack to allow us to have 4 as a letter
    if (val.length === 2 && val[0] === '_') {
      return val[1];
    }
    return val[0];
  }

  throw new Error("unexpected value for letterValue");
};

/**
 * Return a random uppercase letter that isn't in the list of restrictions
 */
WordSearch.randomLetter = function (restrictions) {
  let letterPool = WordSearch.ALL_CHARS;
  if (restrictions) {
    restrictions = new Set(restrictions);
    letterPool = letterPool.filter(c => !restrictions.has(c));
  }

  return randomValue(letterPool);
};
