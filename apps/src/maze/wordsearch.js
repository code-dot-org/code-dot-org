import color from '../color';
import Subtype from './subtype';
import _ from 'lodash';
import { cellId } from './mazeUtils';
import { SquareType } from './tiles';
import { SVG_NS } from '../constants';

// this should match with Maze.SQUARE_SIZE
const SQUARE_SIZE = 50;

/**
 * Create a new WordSearch.
 */
export default class WordSearch extends Subtype {
  constructor(maze, studioApp, config) {
    super(maze, studioApp, config);
    this.goal_ = config.level.searchWord;
    this.visited_ = '';
    this.map_ = config.level.map;
  }

  isWordSearch() {
    return true;
  }

  /**
   * Generate random tiles for walls (with some restrictions) and draw them to
   * the svg.
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

        this.drawTile_(svg, letter, row, col);
      }
    }
  }

  /**
   * Returns true if we've spelled the right word.
   */
  finished() {
    return this.visited_ === this.goal_;
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
   * Draw a given tile.  Overrides the logic of Maze.drawTile
   */
  drawTile_(svg, letter, row, col) {
    const backgroundId = cellId('backgroundLetter', row, col);
    const textId = cellId('letter', row, col);

    const group = document.createElementNS(SVG_NS, 'g');
    const background = document.createElementNS(SVG_NS, 'rect');
    background.setAttribute('id', backgroundId);
    background.setAttribute('width', SQUARE_SIZE);
    background.setAttribute('height', SQUARE_SIZE);
    background.setAttribute('x', col * SQUARE_SIZE);
    background.setAttribute('y', row * SQUARE_SIZE);
    background.setAttribute('stroke', '#000000');
    background.setAttribute('stroke-width', 3);
    group.appendChild(background);

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('id', textId);
    text.setAttribute('class', 'search-letter');
    text.setAttribute('width', SQUARE_SIZE);
    text.setAttribute('height', SQUARE_SIZE);
    text.setAttribute('x', (col + 0.5) * SQUARE_SIZE);
    text.setAttribute('y', (row + 0.5) * SQUARE_SIZE);
    text.setAttribute('font-size', 32);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Verdana');
    text.textContent = letter;
    group.appendChild(text);
    svg.appendChild(group);
  }

  /**
   * Reset all tiles to beginning state
   */
  resetTiles() {
    for (let row = 0; row < this.map_.length; row++) {
      for (let col = 0; col < this.map_[row].length; col++) {
        this.updateTileHighlight_(row, col, false);
      }
    }
    document.getElementById('currentWordContents').textContent = '';
    this.visited_ = '';
  }

  /**
   * Update a tile's highlighting. If we've flown over it, it should be green.
   * Otherwise we have a checkboard approach.
   */
  updateTileHighlight_(row, col, highlighted) {
    let backColor = (row + col) % 2 === 0 ? '#dae3f3' : '#ffffff';
    const textColor = highlighted ? color.white : color.black;
    if (highlighted) {
      backColor = '#00b050';
    }
    const backgroundId = cellId('backgroundLetter', row, col);
    const textId = cellId('letter', row, col);

    document.getElementById(backgroundId).setAttribute('fill', backColor);
    const text = document.getElementById(textId);
    text.setAttribute('fill', textColor);

    // should only be false in unit tests
    if (text.getBBox) {
      // center text.
      const bbox = text.getBBox();
      const heightDiff = SQUARE_SIZE - bbox.height;
      const targetTopY = row * SQUARE_SIZE + heightDiff / 2;
      const offset = targetTopY - bbox.y;

      text.setAttribute("transform", `translate(0, ${offset})`);
    }
  }

  /**
   * Mark that we've visited a tile
   * @param {number} row Row visited
   * @param {number} col Column visited
   * @param {boolean} animating True if this is while animating
   */
  markTileVisited(row, col, animating) {
    const letter = document.getElementById(cellId('letter', row, col)).textContent;
    this.visited_ += letter;

    if (animating) {
      this.updateTileHighlight_(row, col, true);
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
  let letterPool;
  if (restrictions) {
    // args consists of ALL_CHARS followed by the set of restricted letters
    const args = restrictions || [];
    args.unshift(WordSearch.ALL_CHARS);
    letterPool = _.without.apply(null, args);
  } else {
    letterPool = WordSearch.ALL_CHARS;
  }

  return _.sample(letterPool);
};
