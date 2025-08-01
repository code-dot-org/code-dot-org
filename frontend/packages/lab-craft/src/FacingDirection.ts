export enum Direction {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

class FacingDirection {
  static North: Direction = Direction.North;
  static East: Direction = Direction.East;
  static South: Direction = Direction.South;
  static West: Direction = Direction.West;

  static opposite(facing: Direction): Direction {
    return ((facing + 2) % 4) as Direction;
  }

  static left(facing: Direction): Direction {
    return FacingDirection.turn(facing, 'left');
  }

  static right(facing: Direction): Direction {
    return FacingDirection.turn(facing, 'right');
  }

  static turnDirection(from: Direction, to: Direction): string {
    if (from === Direction.North) {
      return to === Direction.East ? 'right' : 'left';
    } else if (from === Direction.South) {
      return to === Direction.West ? 'right' : 'left';
    } else if (from === Direction.East) {
      return to === Direction.South ? 'right' : 'left';
    }

    // West
    return to === Direction.North ? 'right' : 'left';
  }

  static turn(facing: Direction, rotation: string): Direction {
    return ((facing + 4 + (rotation === 'right' ? 1 : -1)) % 4) as Direction;
  }

  static directionToOffset(direction: Direction): [number, number] {
    if (direction === Direction.North) {
      return [0, -1];
    } else if (direction === Direction.South) {
      return [0, 1];
    } else if (direction === Direction.East) {
      return [1, 0];
    }

    // West
    return [-1, 0];
  }

  static directionToRelative(direction: Direction): 'Up' | 'Down' | 'Left' | 'Right' {
    if (direction === Direction.North) {
      return 'Up';
    } else if (direction === Direction.South) {
      return 'Down';
    } else if (direction === Direction.East) {
      return 'Right';
    }

    // West
    return 'Left';
  }
}

export default FacingDirection;
