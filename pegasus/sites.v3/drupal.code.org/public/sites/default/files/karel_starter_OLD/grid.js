function Grid(rows, cols) {
	this.grid = new Array(rows);
	for (var i=0; i < rows; i++) {
		this.grid[i] = new Array(cols);
	}
}

Grid.prototype.init = function(value) {
	for (var i = 0; i < this.numRows(); i++) {
		for (var j = 0; j < this.numCols(); j++) {
			this.grid[i][j] = value;
		}
	}
}

Grid.prototype.get = function(i, j) {
	return this.grid[i][j];
}

Grid.prototype.set = function(i, j, value) {
	this.grid[i][j] = value;
}

Grid.prototype.numRows = function() {
	return this.grid.length;
}

Grid.prototype.numCols = function() {
	return this.grid[0].length;
}
