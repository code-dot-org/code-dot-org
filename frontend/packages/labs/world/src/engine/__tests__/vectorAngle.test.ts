// A vector's polar halves: how long it is, and which way it points.
//
// The convention is the whole of it. y is DOWN, so an angle measured from the
// +x axis runs CLOCKWISE on screen — and that has to be the same convention
// `rotate` turns in and the same one an actor's `rotation` is drawn with, or
// "face the way you are going" would face the wrong way and be off by a sign
// nobody could find.

import {describe, expect, it} from 'vitest';

import {Vector} from '../core/Vector';

describe('angle', () => {
  it('reads right as zero', () => {
    expect(new Vector(1, 0).angle()).toBe(0);
  });

  it('reads down as ninety, because y is down', () => {
    // The one that catches a sign flip. In maths-class axes this would be -90.
    expect(new Vector(0, 1).angle()).toBe(90);
  });

  it('reads up as minus ninety', () => {
    expect(new Vector(0, -1).angle()).toBe(-90);
  });

  it('reads left as a half turn', () => {
    expect(Math.abs(new Vector(-1, 0).angle())).toBe(180);
  });

  it('ignores length', () => {
    expect(new Vector(3, 3).angle()).toBeCloseTo(45);
    expect(new Vector(300, 300).angle()).toBeCloseTo(45);
  });

  it('answers zero for a vector pointing nowhere', () => {
    // A question with no answer gets as good a one as any, rather than NaN
    // travelling into a rotation and drawing nothing.
    expect(new Vector(0, 0).angle()).toBe(0);
  });
});

describe('fromAngle', () => {
  it('is angle’s inverse', () => {
    for (const degrees of [0, 30, 90, 179, -90, -135]) {
      expect(Vector.fromAngle(degrees).angle()).toBeCloseTo(degrees);
    }
  });

  it('makes a unit vector by default', () => {
    expect(Vector.fromAngle(37).length()).toBeCloseTo(1);
  });

  it('takes a length', () => {
    const thrust = Vector.fromAngle(90, 5);

    expect(thrust.length()).toBeCloseTo(5);
    expect(thrust.x).toBeCloseTo(0);
    expect(thrust.y).toBeCloseTo(5);
  });
});

describe('the two conventions agreeing', () => {
  it('turns the way `rotate` turns', () => {
    // If these disagreed, `rotate ⟨…⟩ by ⟨direction of ⟨…⟩⟩` would be a
    // sentence that reads right and does the opposite.
    const turned = new Vector(1, 0).rotate(90);

    expect(turned.angle()).toBeCloseTo(90);
    expect(turned.y).toBeCloseTo(1);
  });
});
