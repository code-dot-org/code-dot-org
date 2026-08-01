// A 2-D vector value type. Immutable: every operation returns a new Vector, so
// a property holding one cannot be mutated out from under the store. World Lab's
// Spatial properties (position, scale) and Motion's velocity are vectors.

export interface VectorLike {
  x: number;
  y: number;
}

/**
 * What an arithmetic operation will take: another vector, or a plain number.
 *
 * A number broadcasts to both components, the way a scalar does against a vector
 * in GLSL — `velocity × delta` is the same shape of expression as
 * `velocity × wind`, and an authoring surface that made a learner say which one
 * they meant would be asking about types, not about physics.
 */
export type VectorOperand = VectorLike | number;

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

  /** A number as a vector — both components alike. See {@link VectorOperand}. */
  static broadcast(value: VectorOperand): Vector {
    return typeof value === 'number'
      ? new Vector(value, value)
      : Vector.from(value);
  }

  add(other: VectorOperand): Vector {
    const v = Vector.broadcast(other);
    return new Vector(this.x + v.x, this.y + v.y);
  }

  subtract(other: VectorOperand): Vector {
    const v = Vector.broadcast(other);
    return new Vector(this.x - v.x, this.y - v.y);
  }

  /** Component-wise product; a number multiplies both components. */
  multiply(other: VectorOperand): Vector {
    const v = Vector.broadcast(other);
    return new Vector(this.x * v.x, this.y * v.y);
  }

  /** Component-wise quotient; a number divides both components. */
  divide(other: VectorOperand): Vector {
    const v = Vector.broadcast(other);
    return new Vector(this.x / v.x, this.y / v.y);
  }

  /** Scale both components by a scalar — `multiply` with a number, named. */
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
