// Where everything is, arranged so that "what is near here" does not mean
// "look at all of them".
//
// The world's only spatial question used to be answered by walking every actor
// and measuring: `spatial.within` filters the whole list, and Collisions pairs
// every colliding actor with every other one, every frame. That is fine at
// twenty actors and quadratic at a thousand — and `simulation/many` invites a
// learner to a thousand on purpose.
//
// A UNIFORM GRID OF BUCKETS, not a tree. BSP and its relatives are for STATIC
// geometry: they are built once, they are expensive to rebuild, and what they
// buy is a traversal order this lab never asks for. Everything here moves, so
// the structure has to be cheap to make from scratch — which a hash of
// (column, row) is: one multiply and two floors per actor, no balancing, no
// allocation beyond the buckets that are used. A quadtree's adaptivity would
// pay for itself only if actor sizes varied wildly, and in this lab they are
// nearly all one tile.
//
// CENTRES, NOT BOXES. Both questions it answers are about middles — "within 80
// of here" measures middle to middle, exactly as `within` does and for the
// reason its own note gives. That keeps the index ignorant of how big anything
// is, which in turn keeps it in core: sizes live in two different rules.
// Overlap is Collisions' question and wants a different index; when that is
// built it can live beside this one rather than complicate it.
//
// IT IS A CACHE, KEPT PER STEP. The World rebuilds it for the first question
// asked in each step (`World.actorsNear`), because a step is the unit of
// "somebody may have moved things": four hundred questions inside one step get
// one index, and the first question after a step that moved everything gets a
// fresh one. That second half is what a collision test needs — it runs in
// `touch`, after `move`, and an index fixed at the top of the frame would have
// it measuring where things were.

import type {Actor} from './Actor';
import type {Vector} from './Vector';

/**
 * How wide a bucket is, in pixels.
 *
 * Two tiles. A query of radius r touches about (2r/cell + 1)² buckets, so 64
 * puts a typical `within ⟨80⟩` query in nine of them — few enough that the
 * gathering is cheap, wide enough that a world of 32-pixel actors does not
 * spend its time on buckets holding one thing.
 */
const CELL = 64;

/** One bucket's key, packed so the map is keyed by a number rather than a string. */
const keyOf = (column: number, row: number): number =>
  // A row is offset into the top half of a 32-bit pair; the map is sparse, so
  // this only has to be collision-free over the range a world spans.
  ((row & 0xffff) << 16) | (column & 0xffff);

export class SpatialIndex {
  private readonly buckets = new Map<number, Actor[]>();

  /** Put an actor in the bucket its middle falls in. */
  add(actor: Actor, at: Vector): void {
    const key = keyOf(Math.floor(at.x / CELL), Math.floor(at.y / CELL));
    const bucket = this.buckets.get(key);
    if (bucket) {
      bucket.push(actor);
    } else {
      this.buckets.set(key, [actor]);
    }
  }

  /**
   * Every actor whose middle is within `radius` of `(x, y)`.
   *
   * Exact, not a candidate list: the buckets narrow it and the distance test
   * decides, so a caller never has to know this is a grid at all.
   *
   * Squared distances throughout — a square root per actor, to compare against
   * a number that could have been squared once, is the sort of arithmetic that
   * only shows up when there are a thousand of them.
   */
  near(
    x: number,
    y: number,
    radius: number,
    positionOf: (actor: Actor) => Vector,
  ): Actor[] {
    const found: Actor[] = [];
    if (!(radius >= 0)) {
      return found; // NaN, or a negative reach: a neighborhood nothing is in
    }
    const reach = radius * radius;
    const from = Math.floor((x - radius) / CELL);
    const to = Math.floor((x + radius) / CELL);
    const top = Math.floor((y - radius) / CELL);
    const bottom = Math.floor((y + radius) / CELL);
    for (let row = top; row <= bottom; row++) {
      for (let column = from; column <= to; column++) {
        const bucket = this.buckets.get(keyOf(column, row));
        if (!bucket) {
          continue;
        }
        for (const actor of bucket) {
          const at = positionOf(actor);
          const dx = at.x - x;
          const dy = at.y - y;
          if (dx * dx + dy * dy <= reach) {
            found.push(actor);
          }
        }
      }
    }
    return found;
  }
}
