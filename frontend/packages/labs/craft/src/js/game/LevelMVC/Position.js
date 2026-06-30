const FacingDirection = require("./FacingDirection");

const directions = [
  FacingDirection.North,
  FacingDirection.East,
  FacingDirection.South,
  FacingDirection.West
];

module.exports = class Position {

  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Temporarily shadow x and y under array indices, for backwards
    // compatibility with old [x, y] position arrays.
    // TODO elijah: remove this once we are fully converted over to actual
    // Position instances
    this[0] = x;
    this[1] = y;
  }

  static add(left, right) {
    return new Position(left[0] + right[0], left[1] + right[1]);
  }

  static subtract(left, right) {
    return new Position(left[0] - right[0], left[1] - right[1]);
  }

  static equals(left, right) {
    return left[0] === right[0] && left[1] === right[1];
  }

  static directionToOffsetPosition(direction) {
    const offset = FacingDirection.directionToOffset(direction);
    if (offset) {
      return Position.fromArray(offset);
    }
  }

  static isAdjacent(left, right) {
    return directions
      .map(Position.directionToOffsetPosition)
      .some(offset => Position.equals(Position.add(left, offset), right));
  }

  static forward(position, direction) {
    return Position.add(position, Position.directionToOffsetPosition(direction));
  }

  static north(position) {
    return Position.forward(position, FacingDirection.North);
  }

  static east(position) {
    return Position.forward(position, FacingDirection.East);
  }

  static south(position) {
    return Position.forward(position, FacingDirection.South);
  }

  static west(position) {
    return Position.forward(position, FacingDirection.West);
  }

  static getOrthogonalPositions(position) {
    return directions.map(direction => Position.forward(position, direction));
  }

  static manhattanDistance(left, right) {
    const d1 = Math.abs(right.x - left.x);
    const d2 = Math.abs(right.y - left.y);
    return d1 + d2;
  }

  static absoluteDistanceSquare(left, right) {
    return Math.pow(left[0] - right[0], 2) + Math.pow(left[1] - right[1], 2);
  }

  /**
   * Gets all eight surrounding positions - orthogonal and diagonal
   */
  static getSurroundingPositions(position) {
    return Position.getOrthogonalPositions(position).concat([
      Position.north(Position.east(position)),
      Position.north(Position.west(position)),
      Position.south(Position.east(position)),
      Position.south(Position.west(position)),
    ]);
  }

  /**
   * A simple factory method to create Position instances from old [x, y]
   * position arrays. While we are transitioning fully to Position instances,
   * this can be used to easily convert from the old form to the new form. Once
   * we have finished transitioning, this should exclusively be used to parse
   * position arrays in initial level data into Position instances, and all code
   * should be using only Position instances.
   */
  static fromArray(position) {
    return new Position(position[0], position[1]);
  }
};
