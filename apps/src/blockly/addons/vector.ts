/**
 * Vector class used for representing and manipulating 2D vectors in the CdoAngleHelper class.
 * Replicates several methods found in goog.math.Vec2, which was a dependency in the CDO Blockly version
 * of the angle helper. For more details, see:
 * https://github.com/code-dot-org/blockly/blob/v4.1.0/core/ui/fields/angle_helper.js
 *
 * This class provides basic vector operations such as addition, subtraction, and rotation.
 * It is specifically used by the CdoAngleHelper class to:
 *
 * - Represent and calculate positions for elements like the angle picker and background ticks.
 * - Perform geometric transformations, including rotation of vectors around a point, which is essential
 *   for updating and rendering the angle helper's graphical components.
 * - Calculate distances between points, which is used for detecting interactions and positioning elements.
 *
 * The methods provided by this class enable operations such as rotating the angle picker handle around
 * the center, snapping the picker handle to specified angles, and computing distances between points
 * for drag interactions.
 */

export class Vector {
  constructor(public x: number, public y: number) {}

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  add(vec: Vector): Vector {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  subtract(vec: Vector): Vector {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  rotate(angle: number): Vector {
    const rad = angle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newX = this.x * cos - this.y * sin;
    const newY = this.y * cos + this.x * sin;
    return new Vector(newX, newY);
  }

  static rotateAroundPoint(vec: Vector, center: Vector, angle: number): Vector {
    const res = vec.clone().subtract(center).rotate(angle);
    return res.add(center);
  }

  static distance(vec1: Vector, vec2: Vector): number {
    return Math.sqrt(
      Math.pow(vec2.x - vec1.x, 2) + Math.pow(vec2.y - vec1.y, 2)
    );
  }
}
