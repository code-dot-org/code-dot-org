var tiles = require('./tiles');
var SquareType = tiles.SquareType;

var Cell = function (tileType, value, range) {

  /**
   * @type {Number}
   */
  this.tileType_ = tileType;

  /**
   * @type {Number}
   */
  this.originalValue_ = value;

  /**
   * @type {Number}
   */
  this.currentValue_ = undefined;
  this.resetCurrentValue();

  /**
   * @type {Number}
   */
  this.range_ = isNaN(range) ? value : range;
};

module.exports = Cell;

/**
 * Returns a new Cell that's an exact replica of this one
 * @return {Cell}
 */
Cell.prototype.clone = function () {
  var newCell = new Cell(this.tileType_, this.originalValue_, this.range_);
  newCell.setCurrentValue(this.currentValue_);
  return newCell;
};

/**
 * @return {Number}
 */
Cell.prototype.getTile = function () {
  return this.tileType_;
};

/**
 * @return {boolean}
 */
Cell.prototype.isDirt = function () {
  return this.currentValue_ !== undefined;
};

/**
 * @return {boolean}
 */
Cell.prototype.isVariableRange = function () {
  return this.range_ !== this.originalValue_;
};

/**
 * @return {boolean}
 */
Cell.prototype.isVariable = function () {
  return this.isVariableRange();
};

/**
 * @return {Number}
 */
Cell.prototype.getCurrentValue = function () {
  return this.currentValue_;
};

/**
 * @param {Number}
 */
Cell.prototype.setCurrentValue = function (val) {
  this.currentValue_ = val;
};

Cell.prototype.resetCurrentValue = function () {
  this.currentValue_ = this.originalValue_;
};

/**
 * Variable cells can represent a range of possible values. This method
 * returns an array of non-variable Cells based on this Cell's
 * configuration.
 * @return {Cell[]}
 */
Cell.prototype.getPossibleGridAssets = function () {
  var possibilities = [];
  if (this.isVariableRange()) {
    // range can be greater than or less than original value
    var min = Math.min(this.originalValue_, this.range_);
    var max = Math.max(this.originalValue_, this.range_);
    for (var i = min; i <= max; i++) {
      possibilities.push(new Cell(this.tileType_, i));
    }
  } else {
    possibilities.push(this);
  }

  return possibilities;
};


/**
 * Serializes this Cell into JSON
 * @return {Object}
 */
Cell.prototype.serialize = function () {
  return {
    tileType: this.tileType_,
    value: this.originalValue_,
    range: this.range_
  };
};

/**
 * Creates a new Cell from serialized JSON
 * @param {Object}
 * @return {Cell}
 */
Cell.deserialize = function (serialized) {
  return new Cell(
    serialized.tileType,
    serialized.value,
    serialized.range
  );
};

/**
 * Creates a new Cell from a mapCell and an initialDirtCell. This
 * represents the old style of storing map data, and should not be used
 * for any new levels. Note that this style does not support new
 * features such as dynamic ranges or new cloud types. Only used for
 * backwards compatibility.
 * @param {String|Number} mapCell
 * @param {String|Number} initialDirtCell
 * @return {Cell}
 */
Cell.parseFromOldValues = function (mapCell, initialDirtCell) {
  mapCell = parseInt(mapCell);
  initialDirtCell = parseInt(initialDirtCell);

  var tileType, value;

  tileType = parseInt(mapCell);
  if (!isNaN(initialDirtCell) && initialDirtCell !== 0) {
    value = initialDirtCell;
  }

  return new Cell(tileType, value);
};
