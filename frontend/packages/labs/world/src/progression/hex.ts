// Axial hexagon arithmetic, for pointy-top hexagons.
//
// One coordinate system, used by everything: the catalogue authors tile
// positions in it, the layout test checks adjacency in it, and the renderer
// turns it into pixels. See specs/PROGRESSION_UI.md.
//
// Axial means two numbers where three would do: a cube coordinate always
// satisfies `x + y + z = 0`, so the third is never stored. `q` runs east, `r`
// runs south-east, and the six neighbors are the six sums below.

/** A tile's place on the map. `[q, r]`. */
export type Axial = readonly [q: number, r: number];

/**
 * The six directions, clockwise from north-east.
 *
 * Pointy-top hexagons have vertices at 12 and 6 o'clock and EDGES facing 1, 3,
 * 5, 7, 9 and 11 — so there is no "north". A region that wants to point
 * upwards points north-east or north-west; the catalogue's foundations take
 * these six in this order.
 */
export const DIRECTIONS = {
  NE: [1, -1],
  E: [1, 0],
  SE: [0, 1],
  SW: [-1, 1],
  W: [-1, 0],
  NW: [0, -1],
} as const satisfies Record<string, Axial>;

export type DirectionName = keyof typeof DIRECTIONS;

/** The direction names in clockwise order, which is the order regions sit in. */
export const CLOCKWISE: readonly DirectionName[] = [
  'NE',
  'E',
  'SE',
  'SW',
  'W',
  'NW',
];

/** `a + b`. */
export const plus = (a: Axial, b: Axial): Axial => [a[0] + b[0], a[1] + b[1]];

/** `a * n`. */
export const times = (a: Axial, n: number): Axial => [a[0] * n, a[1] * n];

/** Whether two cells are the same one. */
export const same = (a: Axial, b: Axial): boolean =>
  a[0] === b[0] && a[1] === b[1];

/** The six cells touching this one, in {@link CLOCKWISE} order. */
export const neighbors = (cell: Axial): Axial[] =>
  CLOCKWISE.map(name => plus(cell, DIRECTIONS[name]));

/** Whether two cells share a side. */
export const adjacent = (a: Axial, b: Axial): boolean =>
  neighbors(a).some(n => same(n, b));

/**
 * How many steps from the center — the ring a cell sits on.
 *
 * The cube form of the distance, written out: `(|x| + |y| + |z|) / 2` with
 * `z = -x - y` substituted.
 */
export const ring = ([q, r]: Axial): number =>
  (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;

/** How many steps apart two cells are. */
export const distance = (a: Axial, b: Axial): number =>
  ring([a[0] - b[0], a[1] - b[1]]);

/**
 * A cell named by two adjacent directions: `a` steps along one, `b` along the
 * next one clockwise.
 *
 * Every cell can be written this way for exactly one such pair, and its ring is
 * `a + b`. This is how the catalogue's layout is reasoned about — a foundation
 * grows along one direction (`b` zero), and the genre between two foundations
 * lives where both counts are positive — so it is worth having a name.
 */
export const sectorCell = (sector: number, a: number, b: number): Axial => {
  const u = DIRECTIONS[CLOCKWISE[sector % 6]];
  const v = DIRECTIONS[CLOCKWISE[(sector + 1) % 6]];
  return plus(times(u, a), times(v, b));
};

/**
 * Where a cell is drawn, in units of the hexagon's circumradius.
 *
 * The standard pointy-top conversion. A renderer multiplies by the size it
 * wants; nothing here knows about pixels.
 */
export const toPoint = ([q, r]: Axial): {x: number; y: number} => ({
  x: Math.sqrt(3) * (q + r / 2),
  y: 1.5 * r,
});
