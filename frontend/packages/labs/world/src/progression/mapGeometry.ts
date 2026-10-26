// Turning cells into shapes: the polygon a tile is drawn as, the outline around
// a region, the bar that draws a prerequisite, and the box that holds all of it.
//
// Everything here is pure and unit-free until a `size` is passed in. `size` is
// the hexagon's CIRCUMRADIUS — center to corner — which is what the axial
// conversion in ./hex is already expressed in, so one number scales the map.
//
// See specs/PROGRESSION_UI.md for what these are for.

import {
  DIRECTIONS,
  plus,
  same,
  toPoint,
  type Axial,
  type DirectionName,
} from './hex';

export interface Point {
  x: number;
  y: number;
}

/**
 * The six corners of a pointy-top hexagon of circumradius 1, centered on the
 * origin, in the order a polygon walks them.
 *
 * Corner `i` is at `60i - 30` degrees, which puts corners at 12 and 6 o'clock
 * and flats facing east and west — a pointy-top hexagon, which is the one the
 * axial conversion in ./hex assumes.
 */
export const UNIT_CORNERS: readonly Point[] = Array.from(
  {length: 6},
  (_, i) => {
    const angle = ((60 * i - 30) * Math.PI) / 180;
    return {x: Math.cos(angle), y: Math.sin(angle)};
  },
);

/**
 * Which neighbor each SIDE faces. Side `s` runs from corner `s` to corner
 * `s + 1`, and its outward normal is at `60s` degrees: east, then round
 * clockwise. Written out rather than derived so the correspondence can be read.
 */
export const SIDE_DIRECTIONS: readonly DirectionName[] = [
  'E',
  'SE',
  'SW',
  'W',
  'NW',
  'NE',
];

/** Where a cell's center is drawn. */
export const center = (cell: Axial, size: number): Point => {
  const unit = toPoint(cell);
  return {x: unit.x * size, y: unit.y * size};
};

/**
 * A cell's corners, optionally shrunk toward its center.
 *
 * `inset` below 1 is what puts a hairline between neighbouring tiles: at 1 they
 * share a side exactly, which reads as one continuous surface rather than as
 * tiles. The region FILL is drawn at 1 for that very reason, and the tiles on
 * top of it are not.
 */
export const cellCorners = (cell: Axial, size: number, inset = 1): Point[] => {
  const at = center(cell, size);
  return UNIT_CORNERS.map(corner => ({
    x: at.x + corner.x * size * inset,
    y: at.y + corner.y * size * inset,
  }));
};

/** A cell as an SVG `points` attribute. */
export const cellPoints = (cell: Axial, size: number, inset = 1): string =>
  cellCorners(cell, size, inset)
    .map(({x, y}) => `${round(x)},${round(y)}`)
    .join(' ');

/**
 * The outline around a set of cells: every side not shared with another cell in
 * the set.
 *
 * One `<path>` of unjoined subpaths rather than a walked, joined outline. The
 * join would matter for a dash pattern or a gradient along the path and matters
 * for nothing here: at the stroke widths a region outline is drawn in, a round
 * line cap at a 120° corner and a round line JOIN at one are the same picture,
 * and this is twenty lines shorter and cannot get the winding wrong.
 */
export const boundaryPath = (cells: readonly Axial[], size: number): string => {
  const parts: string[] = [];
  for (const cell of cells) {
    const corners = cellCorners(cell, size);
    SIDE_DIRECTIONS.forEach((direction, side) => {
      const beyond = plus(cell, DIRECTIONS[direction]);
      if (cells.some(other => same(other, beyond))) {
        return;
      }
      const from = corners[side];
      const to = corners[(side + 1) % 6];
      parts.push(
        `M${round(from.x)},${round(from.y)}L${round(to.x)},${round(to.y)}`,
      );
    });
  }
  return parts.join('');
};

/**
 * The bar that draws a prerequisite: a segment lying ALONG the side the two
 * cells share, centered on it, `fraction` of its length.
 *
 * Not a line between the two centers, which is the obvious thing and is
 * entirely hidden under the two tiles at any size that fits a title in one.
 *
 * Returns nothing if the cells do not touch — an edge between non-neighbors is
 * a catalogue bug (the layout test refuses one), and the renderer should draw
 * nothing rather than guess.
 */
export const edgeBar = (
  from: Axial,
  to: Axial,
  size: number,
  fraction = 0.55,
): [Point, Point] | undefined => {
  const side = SIDE_DIRECTIONS.findIndex(direction =>
    same(plus(from, DIRECTIONS[direction]), to),
  );
  if (side < 0) {
    return undefined;
  }
  const corners = cellCorners(from, size);
  const a = corners[side];
  const b = corners[(side + 1) % 6];
  const mid = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
  const lerp = (point: Point): Point => ({
    x: mid.x + (point.x - mid.x) * fraction,
    y: mid.y + (point.y - mid.y) * fraction,
  });
  return [lerp(a), lerp(b)];
};

/**
 * The box that holds every cell, with room for a hexagon's worth of margin.
 *
 * Computed from the cells rather than written down, so adding a tile to the
 * catalogue never means editing a layout constant.
 */
export const extent = (
  cells: readonly Axial[],
  size: number,
  margin = 0.5,
): {x: number; y: number; width: number; height: number} => {
  const points = cells.map(cell => center(cell, size));
  const pad = size * (1 + margin);
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return {
    x,
    y,
    width: Math.max(...xs) + pad - x,
    height: Math.max(...ys) + pad - y,
  };
};

/** Two decimals is a tenth of a pixel at any size this map is drawn at. */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * A title, broken to fit inside a hexagon.
 *
 * Greedy, on an estimated character width, because SVG cannot measure text
 * without laying it out and this runs for sixty-seven tiles on every resize.
 * Being approximate is fine: the box it wraps to is narrower than the hexagon,
 * so a wrong guess loses a little space rather than spilling over the edge.
 * Anything past `lines` is dropped and the last line ends in an ellipsis — the
 * detail pane carries the whole title, and the list view carries all of them.
 */
export const wrapTitle = (
  title: string,
  {
    width,
    lines = 3,
    charWidth = 0.5,
  }: {width: number; lines?: number; charWidth?: number},
): string[] => {
  const perLine = Math.max(4, Math.floor(width / charWidth));
  const out: string[] = [];
  let current = '';
  for (const word of title.split(/\s+/)) {
    const joined = current ? `${current} ${word}` : word;
    if (joined.length <= perLine || !current) {
      current = joined;
    } else {
      out.push(current);
      current = word;
    }
  }
  if (current) {
    out.push(current);
  }
  if (out.length <= lines) {
    return out;
  }
  const kept = out.slice(0, lines);
  kept[lines - 1] = `${kept[lines - 1].replace(/[\s,]+$/, '')}…`;
  return kept;
};
