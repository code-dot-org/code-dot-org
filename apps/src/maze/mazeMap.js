module.exports = class MazeMap {
  constructor(grid) {
    this.grid_ = grid;

    this.ROWS = this.grid_.length;
    this.COLS = this.grid_[0].length;

    this.staticGrids = this.constructor.getAllStaticGrids(this.grid_);

    this.currentStaticGrid = this.staticGrids[0];
  }

  /**
   * Clones the given grid of Cells by calling Cell.clone
   * @param {Cell[][]} grid
   * @return {Cell[][]} grid
   */
  static cloneGrid(grid) {
    return grid.map(row => row.map(cell => cell.clone()));
  }

  /**
   * Given a single grid of Cells, some of which may be "variable"
   * cells, return a list of grids of non-variable Cells representing
   * all possible variable combinations.
   * @param {Cell[][]} variableGrid
   * @return {Cell[][][]} grids
   */
  static getAllStaticGrids(variableGrid) {
    let grids = [variableGrid];
    variableGrid.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell.isVariable()) {
          const possibleAssets = cell.getPossibleGridAssets();
          const newGrids = [];
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

  static deserialize(serializedValues, cellClass) {
    return new MazeMap(serializedValues.map(row => row.map(cellClass.deserialize)));
  }

  static parseFromOldValues(map, initialDirt, cellClass) {
    return new MazeMap(map.map((row, x) => row.map((mapCell, y) => {
      const initialDirtCell = initialDirt && initialDirt[x][y];
      return cellClass.parseFromOldValues(mapCell, initialDirtCell);
    })));
  }

  resetDirt() {
    this.forEachCell(cell => {
      cell.resetCurrentValue();
    });
  }

  forEachCell(cb) {
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
   * @return {Cell[]}
   */
  getAllCells() {
    return this.currentStaticGrid.reduce(
      (prev, curr) => prev.concat(curr), []
    );
  }

  getCell(x, y) {
    return this.currentStaticGrid[x] && this.currentStaticGrid[x][y];
  }

  isDirt(x, y) {
    let cell = this.getCell(x, y);
    return cell && cell.isDirt();
  }

  getTile(x, y) {
    let cell = this.getCell(x, y);
    return cell && cell.getTile();
  }

  getValue(x, y) {
    let cell = this.getCell(x, y);
    return cell && cell.getCurrentValue();
  }

  setValue(x, y, val) {
    if (this.currentStaticGrid[x] && this.currentStaticGrid[x][y]) {
      this.currentStaticGrid[x][y].setCurrentValue(val);
    }
  }

  /**
   * Some functionality - most notably Bee's shouldCheckCloud and
   * shouldCheckPurple logic - need to be able to make decisions based on
   * details about the original (variable) cell at a coordinate.
   * @returns {Cell}
   */
  getVariableCell(x, y) {
    if (this.grid_[x] && this.grid_[x][y]) {
      return this.grid_[x][y];
    }
  }

  /**
   * Assigns this.currentStaticGrid to the appropriate grid and resets all
   * current values
   * @param {Number} id
   */
  useGridWithId(id) {
    this.currentStaticGrid = this.staticGrids[id];
    this.resetDirt();
  }

  clone() {
    this.constructor.cloneGrid(this.grid_);
  }

  /**
   * @return {boolean}
   */
  hasMultiplePossibleGrids() {
    return this.staticGrids.length > 1;
  }
};
