class Cell {
  constructor(tileType, value, range) {

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
  }

  /**
   * Returns a new Cell that's an exact replica of this one
   * @return {Cell}
   */
  clone() {
    // serialization/deserialization captures the configuration
    const newCell = this.constructor.deserialize(this.serialize());

    // currentValue assignment captures the state
    newCell.setCurrentValue(this.currentValue_);
    return newCell;
  }

  /**
   * @return {Number}
   */
  getTile() {
    return this.tileType_;
  }

  /**
   * @return {boolean}
   */
  hasValue() {
    return this.currentValue_ !== undefined;
  }

  /**
   * @return {boolean}
   */
  isDirt() {
    return this.currentValue_ !== undefined;
  }

  /**
   * @return {boolean}
   */
  isVariableRange() {
    return this.range_ !== this.originalValue_;
  }

  /**
   * @return {boolean}
   */
  isVariable() {
    return this.isVariableRange();
  }

  /**
   * @return {Number}
   */
  getOriginalValue() {
    return this.originalValue_;
  }

  /**
   * @return {Number}
   */
  getCurrentValue() {
    return this.currentValue_;
  }

  /**
   * @param {Number}
   */
  setCurrentValue(val) {
    this.currentValue_ = val;
  }

  resetCurrentValue() {
    this.currentValue_ = this.originalValue_;
  }

  /**
   * Variable cells can represent a range of possible values. This method
   * returns an array of non-variable Cells based on this Cell's
   * configuration.
   * @return {Cell[]}
   */
  getPossibleGridAssets() {
    const possibilities = [];
    if (this.isVariableRange()) {
      // range can be greater than or less than original value
      const min = Math.min(this.originalValue_, this.range_);
      const max = Math.max(this.originalValue_, this.range_);
      for (let i = min; i <= max; i++) {
        possibilities.push(new Cell(this.tileType_, i));
      }
    } else {
      possibilities.push(this);
    }

    return possibilities;
  }

  /**
   * Serializes this Cell into JSON
   * @return {Object}
   */
  serialize() {
    return {
      tileType: this.tileType_,
      value: this.originalValue_,
      range: this.range_
    };
  }
}

export default Cell;

/**
 * Creates a new Cell from serialized JSON
 * @param {Object}
 * @return {Cell}
 */
Cell.deserialize = serialized => new Cell(
  serialized.tileType,
  serialized.value,
  serialized.range
);

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
Cell.parseFromOldValues = (mapCell, initialDirtCell) => {
  mapCell = parseInt(mapCell);
  initialDirtCell = parseInt(initialDirtCell);

  let tileType, value;

  tileType = parseInt(mapCell);
  if (!isNaN(initialDirtCell) && initialDirtCell !== 0) {
    value = initialDirtCell;
  }

  return new Cell(tileType, value);
};
