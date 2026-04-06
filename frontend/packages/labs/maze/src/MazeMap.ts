import Cell, {type CellSerialization, type CellConstructor} from './Cell';

export interface MazeMapSerialization<U extends CellSerialization> {
  cells: U[][];
}

class MazeMap<T extends Cell> {
  grid_: T[][];
  staticGrids: T[][][];

  currentStaticGrid: T[][];

  ROWS: number;
  COLS: number;

  constructor(grid: T[][]) {
    this.grid_ = grid;

    this.ROWS = this.grid_.length;
    this.COLS = this.grid_[0].length;

    this.staticGrids = (
      this.constructor as typeof MazeMap<T>
    ).getAllStaticGrids(this.grid_) as T[][][];

    this.currentStaticGrid = this.staticGrids[0];
  }

  /**
   * Clones the given grid of Cells by calling Cell.clone
   */
  static cloneGrid<T extends Cell>(grid: T[][]): T[][] {
    return grid.map(row => row.map((cell: T) => cell.clone())) as T[][];
  }

  /**
   * Given a single grid of Cells, some of which may be "variable"
   * cells, return a list of grids of non-variable Cells representing
   * all possible variable combinations.
   */
  static getAllStaticGrids(variableGrid: Cell[][]): Cell[][][] {
    let grids = [variableGrid];
    variableGrid.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell.isVariable()) {
          const possibleAssets = cell.getPossibleGridAssets();
          const newGrids: Cell[][][] = [];
          possibleAssets.forEach(asset => {
            grids.forEach(grid => {
              const newMap = this.cloneGrid(grid);
              newMap[x][y] = asset;
              newGrids.push(newMap);
            });
          });
          grids = newGrids;
        }
      });
    });
    return grids;
  }

  static deserialize(
    serializedValues: CellSerialization[][],
    cellClass: CellConstructor,
  ): MazeMap<Cell> {
    return new MazeMap(
      serializedValues.map(row =>
        row.map((cellClass as typeof Cell).deserialize),
      ),
    );
  }

  static parseFromOldValues(
    map: (number | string)[][],
    initialDirt: (number | string)[][] | undefined,
    cellClass: CellConstructor,
  ): MazeMap<Cell> {
    return new MazeMap(
      map.map((row, x) =>
        row.map((mapCell, y) => {
          const initialDirtCell = initialDirt?.[x]?.[y];
          return (cellClass as typeof Cell).parseFromOldValues(
            mapCell,
            initialDirtCell,
          );
        }),
      ),
    );
  }

  resetDirt() {
    this.forEachCell((cell: Cell, _row: number, _col: number) => {
      (cell as T).resetCurrentValue();
    });
  }

  forEachCell(cb: (cell: Cell, row: number, col: number) => void) {
    this.currentStaticGrid.forEach((row, x) => {
      row.forEach((cell, y) => {
        cb(cell, x, y);
      });
    });
  }

  /**
   * Returns a flattened list of all cells in this map. Good for
   * situations where we want to map or reduce the cells without caring
   * about their position
   */
  getAllCells(): T[] {
    return this.currentStaticGrid.reduce((prev, curr) => prev.concat(curr), []);
  }

  getCell(x: number, y: number): T | undefined {
    return this.currentStaticGrid[x] && this.currentStaticGrid[x][y];
  }

  isDirt(x: number, y: number): boolean | undefined {
    const cell = this.getCell(x, y);
    return cell && cell.isDirt();
  }

  getTile(x: number, y: number): number | undefined {
    const cell = this.getCell(x, y);
    return cell && cell.getTile();
  }

  getValue(x: number, y: number): number | undefined {
    const cell = this.getCell(x, y);
    return cell && cell.getCurrentValue();
  }

  setValue(x: number, y: number, val: number) {
    if (this.currentStaticGrid[x] && this.currentStaticGrid[x][y]) {
      this.currentStaticGrid[x][y].setCurrentValue(val);
    }
  }

  /**
   * Some functionality - most notably Bee's shouldCheckCloud and
   * shouldCheckPurple logic - need to be able to make decisions based on
   * details about the original (variable) cell at a coordinate.
   */
  getVariableCell(x: number, y: number): T | undefined {
    return this.grid_?.[x]?.[y];
  }

  /**
   * Assigns this.currentStaticGrid to the appropriate grid and resets all
   * current values
   */
  useGridWithId(id: number) {
    this.currentStaticGrid = this.staticGrids[id];
    this.resetDirt();
  }

  clone(): MazeMap<T> {
    return new MazeMap<T>(MazeMap.cloneGrid(this.grid_));
  }

  hasMultiplePossibleGrids(): boolean {
    return this.staticGrids.length > 1;
  }
}

export default MazeMap;
