import Cell from './Cell';
import type MazeController from './MazeController';
import Subtype, {type SubtypeConfiguration} from './Subtype';
import {SquareType} from './tiles';
import {randomValue} from './utils';
import WordSearchDrawer from './WordSearchDrawer';

/**
 * Create a new WordSearch.
 */
class WordSearch extends Subtype<Cell, WordSearchDrawer> {
  goal_: string;
  private visited_: string;
  private map_: (string | number)[][];

  static START_CHAR: string = '-';
  static EMPTY_CHAR: string = '_';
  static ALL_CHARS: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  /**
   * Return a random uppercase letter that isn't in the list of restrictions
   */
  static randomLetter(restrictions?: string[]): string {
    let letterPool = WordSearch.ALL_CHARS;
    const set = new Set(restrictions || []);
    letterPool = letterPool.filter(c => !set.has(c));

    return randomValue(letterPool);
  }

  /**
   * For wordsearch, values in Maze.map can take the form of a number (i.e. 2 means
   * start), a letter ('A' means A), or a letter followed by x ('Nx' means N and
   * that this is the finish.  This function will strip the x, and will convert
   * number values to WordSearch.START_CHAR
   */
  static letterValue(val: string | number): string {
    if (typeof val === 'number') {
      return WordSearch.START_CHAR;
    }

    if (typeof val === 'string') {
      // temporary hack to allow us to have 4 as a letter
      if (val.length === 2 && val[0] === '_') {
        return val[1];
      }
      return val[0];
    }

    throw new Error('unexpected value for letterValue');
  }

  constructor(maze: MazeController, config: SubtypeConfiguration) {
    super(maze, config);

    this.goal_ = config.level?.searchWord || '';
    this.visited_ = '';
    this.map_ = (config.level?.map || []) as string[][];
  }

  getVisited(): string {
    return this.visited_;
  }

  /** @override */
  isWordSearch(): boolean {
    return true;
  }

  /** @override */
  createDrawer(svg: SVGSVGElement) {
    if (this.maze_.map) {
      this.drawer = new WordSearchDrawer(this.maze_.map, '', svg);
    }
  }

  /**
   * Returns true if the given row,col is both on the grid and not a wall
   */
  isOpen_(row: number, col: number): boolean {
    const map = this.map_;
    return (
      map[row] !== undefined &&
      map[row][col] !== undefined &&
      map[row][col] !== SquareType.WALL
    );
  }

  /**
   * Given a row and col, returns the row, col pair of any non-wall neighbors
   */
  openNeighbors_(row: number, col: number): [number, number][] {
    const neighbors: [number, number][] = [];
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
  restrictedValues_(row: number, col: number): string[] {
    const map = this.map_;
    const neighbors = this.openNeighbors_(row, col);
    const values: string[] = [];
    for (let i = 0; i < neighbors.length; i++) {
      const secondNeighbors = this.openNeighbors_(
        neighbors[i][0],
        neighbors[i][1],
      );
      for (let j = 0; j < secondNeighbors.length; j++) {
        const neighborRow = secondNeighbors[j][0];
        const neighborCol = secondNeighbors[j][1];
        // push value to restricted list
        const val = WordSearch.letterValue(map[neighborRow][neighborCol]);
        values.push(val);
      }
    }

    return values;
  }

  /**
   * Generate random tiles for walls (with some restrictions) and draw them to
   * the svg.
   * @override
   */
  drawMapTiles(svg: SVGSVGElement) {
    let letter: string = '';
    let restricted;

    for (let row = 0; row < this.map_.length; row++) {
      for (let col = 0; col < this.map_[row].length; col++) {
        const mapVal = this.map_[row][col] as string;
        if (mapVal === WordSearch.EMPTY_CHAR) {
          restricted = this.restrictedValues_(row, col);
          letter = WordSearch.randomLetter(restricted);
        } else {
          letter = WordSearch.letterValue(mapVal);
        }

        this.drawTile(svg, [0, 0], row, col, letter);
      }
    }
  }

  /**
   * Reset all tiles to beginning state
   * @override
   */
  resetTiles(): boolean {
    for (let row = 0; row < this.map_.length; row++) {
      for (let col = 0; col < this.map_[row].length; col++) {
        this.drawer?.updateTileHighlight(row, col, false);
      }
    }

    const element = document.getElementById('currentWordContents');
    if (element) {
      element.textContent = '';
    }
    this.visited_ = '';

    // We handled it.
    return true;
  }

  /**
   * Mark that we've visited a tile
   * @param row - Row visited
   * @param col - Column visited
   * @param animating - True if this is while animating
   */
  markTileVisited(row: number, col: number, animating: boolean) {
    const letterCell = document.getElementById(
      WordSearchDrawer.cellId('letter', row, col),
    );
    if (letterCell) {
      this.visited_ += letterCell.textContent;
    }

    if (animating) {
      this.drawer?.updateTileHighlight(row, col, true);
      const element = document.getElementById('currentWordContents');
      if (element) {
        element.textContent = this.visited_;
      }
    }
  }
}

export default WordSearch;
