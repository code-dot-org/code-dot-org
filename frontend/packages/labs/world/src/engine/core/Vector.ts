// A 2-D vector value type. Immutable: every operation returns a new Vector, so
// a property holding one cannot be mutated out from under the store. World Lab's
// Spatial properties (position, scale) and Motion's velocity are vectors.

export interface VectorLike {
  x: number;
  y: number;
}

const DEG_TO_RAD = Math.PI / 180;

export class Vector implements VectorLike {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Coerce a plain `{x, y}` (as learners write in defaults) to a Vector. */
  static from(v: VectorLike): Vector {
    return v instanceof Vector ? v : new Vector(v.x, v.y);
  }

  add(other: VectorLike): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other: VectorLike): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  /** Scale both components by a scalar. */
  scale(factor: number): Vector {
    return new Vector(this.x * factor, this.y * factor);
  }

  /** Rotate clockwise by `degrees` (screen space: +y is down). */
  rotate(degrees: number): Vector {
    const r = degrees * DEG_TO_RAD;
    const cos = Math.cos(r);
    const sin = Math.sin(r);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  equals(other: VectorLike): boolean {
    return this.x === other.x && this.y === other.y;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }
}
