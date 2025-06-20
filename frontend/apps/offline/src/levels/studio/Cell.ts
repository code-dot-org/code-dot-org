/**
 * The JSON representation of a Cell.
 */
export interface CellSerialization {
  tileType: number;
  speed: number;
  size: number;
  direction: number;
  emotion: number;
  sprite: number;
}

/**
 * Represents a single grid cell in a Studio level.
 */
class Cell {
  /** The type of the tile. */
  readonly tileType: number;
  readonly speed: number;
  readonly size: number;
  readonly direction: number;
  readonly emotion: number;
  readonly sprite: number;

  /**
   * Creates a Cell instance with the given properties.
   */
  constructor(
    tileType: number,
    speed: number,
    size: number,
    direction: number,
    emotion: number,
    sprite: number,
  ) {
    this.tileType = tileType;
    this.speed = speed;
    this.size = size;
    this.direction = direction;
    this.emotion = emotion;
    this.sprite = sprite;
  }

  /**
   * Creates a copy of the Cell.
   */
  clone(): Cell {
    return new Cell(
      this.tileType,
      this.speed,
      this.size,
      this.direction,
      this.emotion,
      this.sprite,
    );
  }

  /**
   * Returns a JSON representation of the Cell.
   */
  serialize(): CellSerialization {
    return {
      tileType: this.tileType,
      speed: this.speed,
      size: this.size,
      direction: this.direction,
      emotion: this.emotion,
      sprite: this.sprite,
    };
  }

  /**
   * Creates a cell instance from a proper serialization.
   */
  static deserialize(serialization: CellSerialization): Cell {
    return new Cell(
      serialization.tileType,
      serialization.speed,
      serialization.size,
      serialization.direction,
      serialization.emotion,
      serialization.sprite,
    );
  }
}

export default Cell;
