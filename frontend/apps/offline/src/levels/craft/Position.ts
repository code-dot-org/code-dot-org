import FacingDirection, {Direction} from './FacingDirection';

const directions: [Direction, Direction, Direction, Direction] = [
  Direction.North,
  Direction.East,
  Direction.South,
  Direction.West,
];

class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static add(left: Position, right: Position): Position {
    return new Position(left.x + right.x, left.y + right.y);
  }

  static subtract(left: Position, right: Position): Position {
    return new Position(left.x - right.x, left.y - right.y);
  }

  static equals(left: Position, right: Position): boolean {
    return left.x === right.x && left.y === right.y;
  }

  static directionToOffsetPosition(direction: Direction): Position {
    return Position.fromArray(FacingDirection.directionToOffset(direction));
  }

  static isAdjacent(left: Position, right: Position): boolean {
    return directions
      .map(Position.directionToOffsetPosition)
      .some(offset => Position.equals(Position.add(left, offset), right));
  }

  static forward(position: Position, direction: Direction): Position {
    return Position.add(
      position,
      Position.directionToOffsetPosition(direction),
    );
  }

  static north(position: Position): Position {
    return Position.forward(position, FacingDirection.North);
  }

  static east(position: Position): Position {
    return Position.forward(position, FacingDirection.East);
  }

  static south(position: Position): Position {
    return Position.forward(position, FacingDirection.South);
  }

  static west(position: Position): Position {
    return Position.forward(position, FacingDirection.West);
  }

  static getOrthogonalPositions(
    position: Position,
  ): [Position, Position, Position, Position] {
    return directions.map(direction =>
      Position.forward(position, direction),
    ) as [Position, Position, Position, Position];
  }

  static manhattanDistance(left: Position, right: Position): number {
    const d1 = Math.abs(right.x - left.x);
    const d2 = Math.abs(right.y - left.y);
    return d1 + d2;
  }

  static absoluteDistanceSquare(left: Position, right: Position) {
    return Math.pow(left.x - right.x, 2) + Math.pow(left.y - right.y, 2);
  }

  /**
   * Gets all eight surrounding positions - orthogonal and diagonal
   */
  static getSurroundingPositions(position: Position): Position[] {
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
  static fromArray(position: [number, number]): Position {
    return new Position(position[0], position[1]);
  }
}

export default Position;
