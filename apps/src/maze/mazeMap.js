var MazeMap = function (grid) {
  this.grid_ = grid;

  this.ROWS = this.grid_.length;
  this.COLS = this.grid_[0].length;

  // Initialize the map grid
  //
  // "serializedMaze" is the new way of storing maps; it's a JSON array
  // containing complex map data.
  //
  // "map" plus optionally "levelDirt" is the old way of storing maps;
  // they are each arrays of a combination of strings and ints with
  // their own complex syntax. This way is deprecated for new levels,
  // and only exists for backwards compatibility for not-yet-updated
  // levels.
  //
  // Either way, we turn what we have into a grid of BeeCells, any one
  // of which may represent a number of possible "static" cells. We then
  // turn that variable grid of BeeCells into a set of static grids.
  this.staticGrids = MazeMap.getAllStaticGrids(this.grid_);

  this.currentStaticGridId = 0;
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

MazeMap.prototype.isVariable = function (x, y) {
  if (this.grid_[x] && this.grid_[x][y]) {
    return this.grid_[x][y].isVariable();
  }
};

/**
 * Assigns this.currentStaticGrid to the appropriate grid and resets all
 * current values
 * @param {Number} id
 */
MazeMap.prototype.useGridWithId = function (id) {
  this.currentStaticGridId = id;
  this.currentStaticGrid = this.staticGrids[id];
  this.resetDirt();
};


MazeMap.prototype.clone = function () {
  MazeMap.clone(this.grid_);
};

/**
 * Clones the given grid of BeeCells by calling BeeCell.clone
 * @param {BeeCell[][]} grid
 * @return {BeeCell[][]} grid
 */
MazeMap.cloneGrid = function (grid) {
  return grid.map(function (row) {
    return row.map(function (cell) {
      return cell.clone();
    });
  });
};

/**
 * Given a single grid of BeeCells, some of which may be "variable"
 * cells, return a list of grids of non-variable BeeCells representing
 * all possible variable combinations.
 * @param {BeeCell[][]} variableGrid
 * @return {BeeCell[][][]} grids
 */
MazeMap.getAllStaticGrids = function (variableGrid) {
  var grids = [ variableGrid ];
  variableGrid.forEach(function (row, x) {
    row.forEach(function (cell, y) {
      if (cell.isVariable()) {
        var possibleAssets = cell.getPossibleGridAssets();
        var newGrids = [];
        possibleAssets.forEach(function(asset) {
          grids.forEach(function(grid) {
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
