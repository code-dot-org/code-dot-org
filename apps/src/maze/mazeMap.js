var MazeMap = function (grid) {
  this.grid_ = grid;

  this.ROWS = this.grid_.length;
  this.COLS = this.grid_[0].length;
};
module.exports = MazeMap;

MazeMap.prototype.resetDirt = function () {
  this.forEachCell(function (cell) {
    if (cell.isDirt()) {
      cell.resetCurrentValue();
    }
  });
};

MazeMap.prototype.forEachCell = function (cb) {
  this.grid_.forEach(function (row, x) {
    row.forEach(function (cell, y) {
      cb(cell, x, y);
    });
  });
};

MazeMap.prototype.isDirt = function (x, y) {
  return this.grid_[x] && this.grid_[x][y] && this.grid_[x][y].isDirt();
};

MazeMap.prototype.getTile = function (x, y) {
  return this.grid_[x] && this.grid_[x][y] && this.grid_[x][y].getTile();
};

MazeMap.prototype.getValue = function (x, y) {
  return this.grid_[x] && this.grid_[x][y] && this.grid_[x][y].getCurrentValue();
};

MazeMap.prototype.setValue = function (x, y, val) {
  if (this.grid_[x] && this.grid_[x][y]) {
    this.grid_[x][y].setCurrentValue(val);
  }
};

MazeMap.prototype.clone = function () {
  return this.grid_.map(function (row) {
    return row.map(function (cell) {
      return cell.clone();
    });
  });
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
