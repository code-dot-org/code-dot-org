var MazeMap = function (grid) {
  this.grid_ = grid;

  this.ROWS = this.grid_.length;
  this.COLS = this.grid_[0].length;

  this.staticGrids = MazeMap.getAllStaticGrids(this.grid_);

  this.currentStaticGrid = this.staticGrids[0];
};
module.exports = MazeMap;

MazeMap.prototype.resetDirt = function () {
  this.forEachCell(function (cell) {
    cell.resetCurrentValue();
  });
};

MazeMap.prototype.forEachCell = function (cb) {
  this.currentStaticGrid.forEach(function (row, x) {
    row.forEach(function (cell, y) {
      cb(cell, x, y);
    });
  });
};

MazeMap.prototype.isDirt = function (x, y) {
  return this.currentStaticGrid[x] && this.currentStaticGrid[x][y] && this.currentStaticGrid[x][y].isDirt();
};

MazeMap.prototype.getTile = function (x, y) {
  return this.currentStaticGrid[x] && this.currentStaticGrid[x][y] && this.currentStaticGrid[x][y].getTile();
};

MazeMap.prototype.getValue = function (x, y) {
  return this.currentStaticGrid[x] && this.currentStaticGrid[x][y] && this.currentStaticGrid[x][y].getCurrentValue();
};

MazeMap.prototype.setValue = function (x, y, val) {
  if (this.currentStaticGrid[x] && this.currentStaticGrid[x][y]) {
    this.currentStaticGrid[x][y].setCurrentValue(val);
  }
};

/**
 * Some functionality - most notably Bee's shouldCheckCloud and
 * shouldCheckPurple logic - need to be able to make decisions based on
 * details about the original (variable) cell at a coordinate.
 * @returns {Cell}
 */
MazeMap.prototype.getVariableCell = function (x, y) {
  if (this.grid_[x] && this.grid_[x][y]) {
    return this.grid_[x][y];
  }
};

/**
 * Assigns this.currentStaticGrid to the appropriate grid and resets all
 * current values
 * @param {Number} id
 */
MazeMap.prototype.useGridWithId = function (id) {
  this.currentStaticGrid = this.staticGrids[id];
  this.resetDirt();
};


MazeMap.prototype.clone = function () {
  MazeMap.cloneGrid(this.grid_);
};

/**
 * Clones the given grid of Cells by calling Cell.clone
 * @param {Cell[][]} grid
 * @return {Cell[][]} grid
 */
MazeMap.cloneGrid = function (grid) {
  return grid.map(function (row) {
    return row.map(function (cell) {
      return cell.clone();
    });
  });
};

/**
 * Given a single grid of Cells, some of which may be "variable"
 * cells, return a list of grids of non-variable Cells representing
 * all possible variable combinations.
 * @param {Cell[][]} variableGrid
 * @return {Cell[][][]} grids
 */
MazeMap.getAllStaticGrids = function (variableGrid) {
  var grids = [variableGrid];
  variableGrid.forEach(function (row, x) {
    row.forEach(function (cell, y) {
      if (cell.isVariable()) {
        var possibleAssets = cell.getPossibleGridAssets();
        var newGrids = [];
        possibleAssets.forEach(function (asset) {
          grids.forEach(function (grid) {
            var newMap = MazeMap.cloneGrid(grid);
            newMap[x][y] = asset;
            newGrids.push(newMap);
          });
        });
        grids = newGrids;
      }
    });
  });
  return grids;
};

/**
 * @return {boolean}
 */
MazeMap.prototype.hasMultiplePossibleGrids = function () {
  return this.staticGrids.length > 1;
};


MazeMap.deserialize = function (serializedValues, cellClass) {
  return new MazeMap(serializedValues.map(function (row) {
    return row.map(cellClass.deserialize);
  }));
};

MazeMap.parseFromOldValues = function (map, initialDirt, cellClass) {
  return new MazeMap(map.map(function (row, x) {
    return row.map(function (mapCell, y) {
      var initialDirtCell = initialDirt && initialDirt[x][y];
      return cellClass.parseFromOldValues(mapCell, initialDirtCell);
    });
  }));
};
