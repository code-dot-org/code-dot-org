import type p5 from 'p5';

/**
 * A two-component vector that holds (x, y) even when either is missing or
 * not finite; p5 2.x's createVector leaves such a vector without
 * components (LIF-24).
 */
export function makeVector(p: p5, x: unknown, y: unknown): p5.Vector {
  const v = p.createVector(0, 0);
  if (x !== undefined) {
    v.x = x as number;
  }
  if (y !== undefined) {
    v.y = y as number;
  }
  return v;
}
