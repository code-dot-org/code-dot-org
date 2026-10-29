/**
 * An oriented rectangle (COL-2): its centre and its width and height axes,
 * each the full scaled and rotated edge vector (COL-9).
 */
export interface Box {
  x: number;
  y: number;
  wx: number;
  wy: number;
  hx: number;
  hy: number;
}

export interface Separation {
  overlaps: boolean;
  dx: number;
  dy: number;
}

const PARALLEL_EPSILON = 1e-14;

const NONE: Separation = {overlaps: false, dx: 0, dy: 0};

export function pointBox(x: number, y: number): Box {
  return {x, y, wx: 0, wy: 0, hx: 0, hy: 0};
}

/** COL-7: [-w0/2, w0/2] x [-h0/2, h0/2], scaled, rotated, translated. */
export function orientedBox(
  x: number,
  y: number,
  width: number,
  height: number,
  degrees: number,
): Box {
  const t = (degrees * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  return {
    x,
    y,
    wx: width * cos,
    wy: width * sin,
    hx: -height * sin,
    hy: height * cos,
  };
}

/** The four corners, in order around the outline. */
export function corners(box: Box): [number, number][] {
  const ax = box.wx / 2;
  const ay = box.wy / 2;
  const bx = box.hx / 2;
  const by = box.hy / 2;
  return [
    [box.x - ax - bx, box.y - ay - by],
    [box.x + ax - bx, box.y + ay - by],
    [box.x + ax + bx, box.y + ay + by],
    [box.x - ax + bx, box.y - ay + by],
  ];
}

/** COL-11, for a unit direction (ux, uy). */
export function projectedRadius(box: Box, ux: number, uy: number): number {
  const w = (box.wx * ux + box.wy * uy) / 2;
  const h = (box.hx * ux + box.hy * uy) / 2;
  return Math.max(Math.abs(w + h), Math.abs(w - h));
}

type Axis = [number, number];

/** COL-9: a zero-length axis becomes (1, 0). */
function axis(x: number, y: number): Axis {
  return x === 0 && y === 0 ? [1, 0] : [x, y];
}

/** COL-10. */
function parallel(u: Axis, v: Axis): boolean {
  if (Math.abs(u[0]) < PARALLEL_EPSILON && Math.abs(v[0]) < PARALLEL_EPSILON) {
    return true;
  }
  if (Math.abs(u[1]) < PARALLEL_EPSILON && Math.abs(v[1]) < PARALLEL_EPSILON) {
    return true;
  }
  return Math.abs(u[0] / v[0] - u[1] / v[1]) < PARALLEL_EPSILON;
}

function candidateAxes(a: Box, b: Box): Axis[] {
  const all = [
    axis(a.wx, a.wy),
    axis(a.hx, a.hy),
    axis(b.wx, b.wy),
    axis(b.hx, b.hy),
  ];
  return all.filter(
    (u, i) => !all.slice(i + 1).some(later => parallel(u, later)),
  );
}

/** COL-12, COL-13: the shortest move of `a` that separates it from `b`. */
export function separation(a: Box, b: Box): Separation {
  const cx = b.x - a.x;
  const cy = b.y - a.y;
  let best = Infinity;
  let dx = 0;
  let dy = 0;
  for (const [x, y] of candidateAxes(a, b)) {
    const length = Math.hypot(x, y);
    const ux = x / length;
    const uy = y / length;
    const d = cx * ux + cy * uy;
    const o =
      projectedRadius(a, ux, uy) + projectedRadius(b, ux, uy) - Math.abs(d);
    if (o <= 0) {
      return NONE;
    }
    if (o < best) {
      best = o;
      const sign = d < 0 ? 1 : -1;
      dx = sign * ux * o;
      dy = sign * uy * o;
    }
  }
  return {overlaps: true, dx, dy};
}
