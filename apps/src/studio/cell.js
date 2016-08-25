var Cell = function (tileType, speed, size, direction, emotion, sprite) {

  /**
   * @type {Number}
   */
  this.tileType_ = tileType;

  /**
   * @type {Number}
   */
  this.speed_ = speed;

  /**
   * @type {Number}
   */
  this.size_ = size;

  /**
   * @type {Number}
   */
  this.direction_ = direction;

  /**
   * @type {Number}
   */
  this.emotion_ = emotion;

  /**
   * @type {Number}
   */
  this.sprite_ = sprite;
};

module.exports = Cell;

/**
 * @return {Number}
 */
Cell.prototype.getTileType = function () {
  return this.tileType_;
};

/**
 * Returns a new Cell that's an exact replica of this one
 * @return {Cell}
 */
Cell.prototype.clone = function () {
  var newCell = new Cell(
    this.tileType_,
    this.speed_,
    this.size_,
    this.direction_,
    this.emotion_,
    this.sprite_
  );
  return newCell;
};

/**
 * Serializes this Cell into JSON
 * @return {Object}
 */
Cell.prototype.serialize = function () {
  return {
    tileType: this.tileType_,
    speed: this.speed_,
    size: this.size_,
    direction: this.direction_,
    emotion: this.emotion_,
    sprite: this.sprite_
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
    serialized.speed,
    serialized.size,
    serialized.direction,
    serialized.emotion,
    serialized.sprite
  );
};
