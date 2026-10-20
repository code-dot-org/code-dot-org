// Places checkpoints on a top-to-bottom map. A checkpoint's row is the
// length of the longest `requires` chain beneath it, so roots sit on top and
// every edge points downward.

import {Checkpoint} from '../types';

export const NODE_RADIUS = 34;
const TAU = 2 * Math.PI;
export const BOARD_WIDTH = 760;
const TOP_MARGIN = 96;
const BOTTOM_MARGIN = 60;
const RADIAL_MARGIN = 120;
// Around a destinations grid: above for the boxes and their titles, below
// for a title under the last row, and beside for a member's title next to it.
const DESTINATION_HEADROOM = 40;
const DESTINATION_FOOTROOM = 24;
const DESTINATION_SIDE_MARGIN = 180;

/** Distances between neighbouring nodes, per layout direction. */
export interface Spacing {
  /** Center to center along a row; labels are up to 190 wide. */
  column: number;
  /** Center to center between rows; a node is 116 tall with its label. */
  row: number;
  /** Between radial rings. */
  ring: number;
}

/** Room for lines to run between nodes. */
export const NORMAL_SPACING: Spacing = {column: 200, row: 170, ring: 140};
/** With no lines to make room for, nodes sit nearly touching. */
export const PACKED_SPACING: Spacing = {column: 170, row: 135, ring: 115};
/** For the circle with its title below, whose lines run center to center. */
export const TIGHT_SPACING: Spacing = {column: 120, row: 110, ring: 100};

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  row: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface MapLayout {
  nodes: {[id: string]: NodePosition};
  edges: Edge[];
  width: number;
  height: number;
  /** Guide circles behind a radial layout, about its center. */
  rings?: {x: number; y: number; radii: number[]};
  /** The destination groups of a destinations layout, in authored order. */
  destinations?: DestinationGroup[];
  spacing: Spacing;
}

/** The checkpoints that share a `destination`, in authored order. */
export interface DestinationGroup {
  title: string;
  ids: string[];
}

/**
 * Grid cells in a square spiral from the center: the center cell, then
 * each square ring outward, clockwise from the top. Enough for `count`.
 */
function spiralCells(count: number): {col: number; row: number}[] {
  const cells = [{col: 0, row: 0}];
  for (let k = 1; cells.length < count; k++) {
    const ring: {col: number; row: number}[] = [];
    for (let col = -k; col <= k; col++) {
      for (let row = -k; row <= k; row++) {
        if (Math.max(Math.abs(col), Math.abs(row)) === k) ring.push({col, row});
      }
    }
    // Clockwise from straight up: angle measured from the top, y down.
    const angle = (c: {col: number; row: number}) =>
      (Math.atan2(c.col, -c.row) + TAU) % TAU;
    ring.sort((p, q) => angle(p) - angle(q));
    cells.push(...ring);
  }
  return cells.slice(0, count);
}

/**
 * Hex grid cells, in axial coordinates, spiralling out from the center:
 * the center, then each ring outward, clockwise from the top. Pointy-topped
 * cells, so q steps go right, r steps go down-right.
 */
function hexSpiralCells(count: number): {q: number; r: number}[] {
  const cells = [{q: 0, r: 0}];
  for (let k = 1; cells.length < count; k++) {
    const ring: {q: number; r: number}[] = [];
    for (let q = -k; q <= k; q++) {
      for (let r = -k; r <= k; r++) {
        if ((Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2 === k) {
          ring.push({q, r});
        }
      }
    }
    const angle = (c: {q: number; r: number}) => {
      const {x, y} = hexToPixel(c, 1);
      return (Math.atan2(x, -y) + TAU) % TAU;
    };
    ring.sort((p, q) => angle(p) - angle(q));
    cells.push(...ring);
  }
  return cells.slice(0, count);
}

/** Center of a pointy-topped hex cell whose neighbours are `distance` away. */
function hexToPixel(cell: {q: number; r: number}, distance: number) {
  return {
    x: distance * (cell.q + cell.r / 2),
    y: (Math.sqrt(3) / 2) * distance * cell.r,
  };
}

/**
 * Checkpoints tiled like a honeycomb in authored order, the first in the
 * middle and the rest spiralling outward. Meant for hexagonal nodes, which
 * then sit a small gap apart. `row` is the axial r.
 */
export function layoutHoneycomb(
  checkpoints: Checkpoint[],
  spacing = NORMAL_SPACING
): MapLayout {
  // Neighbouring cell centers are this far apart: a 108px hexagon across
  // the flats plus a gap that shrinks with the spacing.
  const distance = spacing.column * 0.7;
  const cells = hexSpiralCells(checkpoints.length);
  const px = cells.map(c => hexToPixel(c, distance));
  const minX = Math.min(...px.map(p => p.x));
  const maxX = Math.max(...px.map(p => p.x));
  const minY = Math.min(...px.map(p => p.y));
  const maxY = Math.max(...px.map(p => p.y));
  const nodes: {[id: string]: NodePosition} = {};
  checkpoints.forEach((c, i) => {
    nodes[c.id] = {
      id: c.id,
      row: cells[i].r,
      x: Math.round(px[i].x - minX + spacing.column),
      y: Math.round(px[i].y - minY + TOP_MARGIN),
    };
  });
  return {
    nodes,
    edges: edgesOf(checkpoints),
    width: Math.round(maxX - minX + 2 * spacing.column),
    height: Math.round(maxY - minY + TOP_MARGIN + BOTTOM_MARGIN),
    spacing,
  };
}

type Cell = {col: number; row: number};
const cellKey = (c: Cell) => `${c.col},${c.row}`;
// The eight neighbours of a cell, clockwise from the top, edges before
// corners. Ties between candidate cells go to the first generated, so this
// order is the direction preference: a root's children fill above, right,
// below, left, and corners fill clockwise from the top right.
const NEIGHBOUR_OFFSETS: Cell[] = [
  {col: 0, row: -1},
  {col: 1, row: 0},
  {col: 0, row: 1},
  {col: -1, row: 0},
  {col: 1, row: -1},
  {col: 1, row: 1},
  {col: -1, row: 1},
  {col: -1, row: -1},
];
const chebyshev = (a: Cell, b: Cell) =>
  Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
const adjacent = (a: Cell, b: Cell) => chebyshev(a, b) === 1;

/**
 * The city grid: checkpoints on grid cells, grown outward from the root.
 * Each is placed in a free cell touching its parents, so every dependency
 * line runs between neighbours. A child of two parents takes a cell touching
 * both when one is free. Among the cells touching a parent, the one nearest
 * the root wins, then an edge over a corner, so a single parent's child
 * takes an edge and leaves the corners between for children of two parents,
 * and a ring fills before the next starts. A cell touching no parent is a
 * last resort, taken nearest the parents. `row` is the grid row.
 *
 * A pathway that starts as a chain (each checkpoint the only child of the
 * one before) lays that chain down a column first, and the rest grows from
 * where it starts to branch, so the spine reads as an approach to the city
 * rather than its centre.
 */
export function layoutCity(
  checkpoints: Checkpoint[],
  spacing = NORMAL_SPACING
): MapLayout {
  const byId = new Map(checkpoints.map(c => [c.id, c]));
  const placed = new Map<string, Cell>();
  const taken = new Set<string>();
  const place = (id: string, cell: Cell) => {
    placed.set(id, cell);
    taken.add(cellKey(cell));
  };
  const spine = spineOf(checkpoints);
  spine.forEach((id, row) => place(id, {col: 0, row}));
  const origin: Cell = {col: 0, row: Math.max(0, spine.length - 1)};
  // Free cells in rings around `center`, nearest first.
  const nearestFree = (center: Cell): Cell => {
    for (let k = 0; ; k++) {
      const ring = spiralCells((2 * k + 1) ** 2)
        .slice(k === 0 ? 0 : (2 * k - 1) ** 2)
        .map(c => ({col: center.col + c.col, row: center.row + c.row}));
      const free = ring.find(c => !taken.has(cellKey(c)));
      if (free) return free;
    }
  };

  for (const ids of depthRows(checkpoints)) {
    for (const id of ids) {
      if (placed.has(id)) continue;
      const parents = (byId.get(id)?.requires || [])
        .map(p => placed.get(p))
        .filter((c): c is Cell => !!c);
      if (!parents.length) {
        place(id, taken.has(cellKey(origin)) ? nearestFree(origin) : origin);
        continue;
      }
      const seen = new Set<string>();
      const candidates: Cell[] = [];
      for (const parent of parents) {
        for (const d of NEIGHBOUR_OFFSETS) {
          const c = {col: parent.col + d.col, row: parent.row + d.row};
          const key = cellKey(c);
          if (taken.has(key) || seen.has(key)) continue;
          seen.add(key);
          candidates.push(c);
        }
      }
      const touching = (c: Cell) => parents.filter(p => adjacent(p, c)).length;
      const onEdge = (c: Cell) =>
        parents.filter(
          p => adjacent(p, c) && (p.col === c.col || p.row === c.row)
        ).length;
      const best = candidates.sort(
        (p, q) =>
          touching(q) - touching(p) ||
          chebyshev(p, origin) - chebyshev(q, origin) ||
          onEdge(q) - onEdge(p)
      )[0];
      if (best) {
        place(id, best);
        continue;
      }
      const distance = (c: Cell) =>
        parents.reduce((s, p) => s + chebyshev(p, c), 0);
      const fallback = nearestFree(parents[0]);
      place(
        id,
        parents
          .map(nearestFree)
          .reduce((a, b) => (distance(b) < distance(a) ? b : a), fallback)
      );
    }
  }

  const cells = checkpoints.map(c => placed.get(c.id)!);
  return gridLayout(checkpoints, cells, spacing);
}

/**
 * The destinations grid: checkpoints with a `destination` stacked in the
 * outer columns of a square grid. Groups alternate left and right from the
 * top, each a run of rows with a free row between neighbours, and each
 * side's stack is centered on the root's row. The rest sit on the ring of
 * their depth within the inner columns, the root at the center, each in
 * the free cell nearest the direction of its children, so the pathway fans
 * out from the center to its destinations. A leaf with no destination
 * takes a free cell toward its parents. Each `turn` moves every group one
 * place clockwise around the sides: down the right, then up the left.
 * `row` is the grid row.
 */
export function layoutDestinations(
  checkpoints: Checkpoint[],
  spacing = NORMAL_SPACING,
  turns = 0
): MapLayout {
  const groups = destinationGroups(checkpoints);
  const grouped = new Set(groups.flatMap(g => g.ids));
  const depthOf = new Map<string, number>();
  const rows = depthRows(checkpoints);
  rows.forEach((ids, depth) => ids.forEach(id => depthOf.set(id, depth)));
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const {from, to} of edgesOf(checkpoints)) {
    children.set(from, [...(children.get(from) || []), to]);
    parents.set(to, [...(parents.get(to) || []), from]);
  }
  // Inner columns either side of the center: one per ring a checkpoint
  // with children can sit on.
  const innerDepth = Math.max(
    0,
    ...checkpoints
      .filter(c => children.has(c.id) && !grouped.has(c.id))
      .map(c => depthOf.get(c.id)!)
  );
  const half = Math.max(1, innerDepth);

  const placed = new Map<string, Cell>();
  const taken = new Set<string>();
  const place = (id: string, cell: Cell) => {
    placed.set(id, cell);
    taken.add(cellKey(cell));
  };

  const stacks = destinationStacks(groups, turns);
  stacks.forEach((stack, side) => {
    const col = (side === 0 ? -1 : 1) * (half + 1);
    const total = stack.reduce((n, g) => n + g.ids.length + 1, -1);
    let row = -Math.floor(total / 2);
    for (const group of stack) {
      for (const id of group.ids) place(id, {col, row: row++});
      row++;
    }
  });

  // Angles are clockwise from the right, the row axis pointing down.
  const angleOf = (c: Cell) => Math.atan2(c.row, c.col);
  const between = (a: number, b: number) => {
    const d = Math.abs(a - b) % TAU;
    return Math.min(d, TAU - d);
  };
  const meanAngle = (ids: string[]) => {
    const cells = ids.map(id => placed.get(id)!);
    const x = cells.reduce((s, c) => s + Math.cos(angleOf(c)), 0);
    const y = cells.reduce((s, c) => s + Math.sin(angleOf(c)), 0);
    return Math.atan2(y, x);
  };
  const freeOnRing = (k: number): Cell[] =>
    (k === 0 ? [{col: 0, row: 0}] : spiralCells((2 * k + 1) ** 2))
      .slice(k === 0 ? 0 : (2 * k - 1) ** 2)
      .filter(c => Math.abs(c.col) <= half && !taken.has(cellKey(c)));
  const nearestOnRing = (k: number, angle: number): Cell => {
    for (let ring = k; ; ring++) {
      const free = freeOnRing(ring);
      if (free.length) {
        return free.reduce((best, c) =>
          between(angleOf(c), angle) < between(angleOf(best), angle) ? c : best
        );
      }
    }
  };

  // Outer rings first, so each checkpoint's children are placed before it.
  // A leaf with no destination waits for its parents.
  for (let depth = rows.length - 1; depth >= 0; depth--) {
    for (const id of rows[depth]) {
      if (placed.has(id) || !children.has(id)) continue;
      const known = (children.get(id) || []).filter(c => placed.has(c));
      place(id, nearestOnRing(depth, known.length ? meanAngle(known) : 0));
    }
  }
  for (const c of checkpoints) {
    if (placed.has(c.id)) continue;
    const known = (parents.get(c.id) || []).filter(p => placed.has(p));
    const depth = depthOf.get(c.id)!;
    place(c.id, nearestOnRing(depth, known.length ? meanAngle(known) : 0));
  }

  const cells = checkpoints.map(c => placed.get(c.id)!);
  return {
    ...gridLayout(checkpoints, cells, spacing, {
      top: TOP_MARGIN + DESTINATION_HEADROOM,
      bottom: BOTTOM_MARGIN + DESTINATION_FOOTROOM,
      side: Math.max(spacing.column, DESTINATION_SIDE_MARGIN),
    }),
    destinations: groups,
  };
}

/**
 * The groups of the left and right stacks, top to bottom, alternating
 * sides from the top, then moved `turns` places clockwise around the
 * sides.
 */
function destinationStacks(
  groups: DestinationGroup[],
  turns: number
): DestinationGroup[][] {
  const left = groups.filter((_, i) => i % 2 === 0);
  const right = groups.filter((_, i) => i % 2 === 1);
  const clockwise = [...right, ...left.reverse()];
  const shift =
    ((turns % clockwise.length) + clockwise.length) % clockwise.length;
  const turned = [
    ...clockwise.slice(clockwise.length - shift),
    ...clockwise.slice(0, clockwise.length - shift),
  ];
  return [turned.slice(right.length).reverse(), turned.slice(0, right.length)];
}

/** Checkpoints grouped by `destination`, groups and members in authored order. */
function destinationGroups(checkpoints: Checkpoint[]): DestinationGroup[] {
  const groups: DestinationGroup[] = [];
  for (const c of checkpoints) {
    if (!c.destination) continue;
    const group = groups.find(g => g.title === c.destination);
    if (group) group.ids.push(c.id);
    else groups.push({title: c.destination, ids: [c.id]});
  }
  return groups;
}

/**
 * The chain from the sole root up to and including the first checkpoint
 * with other than exactly one child, each link the only child of the one
 * before and requiring nothing else. Empty with no root or more than one.
 */
function spineOf(checkpoints: Checkpoint[]): string[] {
  const byId = new Map(checkpoints.map(c => [c.id, c]));
  const children = new Map<string, string[]>();
  for (const {from, to} of edgesOf(checkpoints)) {
    children.set(from, [...(children.get(from) || []), to]);
  }
  const roots = checkpoints.filter(
    c => !(c.requires || []).some(r => byId.has(r))
  );
  if (roots.length !== 1) return [];
  const spine = [roots[0].id];
  for (;;) {
    const kids = children.get(spine[spine.length - 1]) || [];
    if (kids.length !== 1 || spine.includes(kids[0])) break;
    const requires = (byId.get(kids[0])?.requires || []).filter(r =>
      byId.has(r)
    );
    if (requires.length !== 1) break;
    spine.push(kids[0]);
  }
  return spine;
}

/**
 * A grid layout turned a quarter turn clockwise. What was above the root is
 * now to its right. Columns become rows, so the spacing swaps with them and
 * lines still route through the gaps. Nodes stay upright; `row` is left as
 * it was, and so is the margin on each side of the board.
 */
export function turnLayout(layout: MapLayout): MapLayout {
  const {column, row} = layout.spacing;
  const spacing = {...layout.spacing, column: row, row: column};
  const old = Object.values(layout.nodes);
  const minX = Math.min(...old.map(n => n.x));
  const maxX = Math.max(...old.map(n => n.x));
  const minY = Math.min(...old.map(n => n.y));
  const maxY = Math.max(...old.map(n => n.y));
  // (x, y) -> (-y, x) about the origin, then shifted back into the board.
  const nodes: {[id: string]: NodePosition} = {};
  for (const n of old) {
    nodes[n.id] = {...n, x: minX + (maxY - n.y), y: minY + (n.x - minX)};
  }
  return {
    ...layout,
    nodes,
    spacing,
    width: minX + (maxY - minY) + (layout.width - maxX),
    height: minY + (maxX - minX) + (layout.height - maxY),
  };
}

/**
 * Positions and board size for checkpoints already assigned grid cells.
 * The margins are the usual top and bottom and a column at each side,
 * unless given.
 */
function gridLayout(
  checkpoints: Checkpoint[],
  cells: Cell[],
  spacing: Spacing,
  margin?: {top: number; bottom: number; side: number}
): MapLayout {
  const top = margin?.top ?? TOP_MARGIN;
  const bottom = margin?.bottom ?? BOTTOM_MARGIN;
  const side = margin?.side ?? spacing.column;
  const minCol = Math.min(...cells.map(c => c.col));
  const maxCol = Math.max(...cells.map(c => c.col));
  const minRow = Math.min(...cells.map(c => c.row));
  const maxRow = Math.max(...cells.map(c => c.row));
  const nodes: {[id: string]: NodePosition} = {};
  checkpoints.forEach((c, i) => {
    const {col, row} = cells[i];
    nodes[c.id] = {
      id: c.id,
      row: row - minRow,
      x: side + spacing.column * (col - minCol),
      y: top + (row - minRow) * spacing.row,
    };
  });
  return {
    nodes,
    edges: edgesOf(checkpoints),
    width: 2 * side + spacing.column * (maxCol - minCol),
    height: top + (maxRow - minRow) * spacing.row + bottom,
    spacing,
  };
}

/**
 * Checkpoints on a uniform grid in authored order, the first in the middle
 * and the rest spiralling outward. `row` is the grid row.
 */
export function layoutCluster(
  checkpoints: Checkpoint[],
  spacing = NORMAL_SPACING
): MapLayout {
  return gridLayout(checkpoints, spiralCells(checkpoints.length), spacing);
}

/** One edge per known `requires`, parent to child. */
function edgesOf(checkpoints: Checkpoint[]): Edge[] {
  const ids = new Set(checkpoints.map(c => c.id));
  const edges: Edge[] = [];
  for (const c of checkpoints) {
    for (const r of c.requires || []) {
      if (ids.has(r)) edges.push({from: r, to: c.id});
    }
  }
  return edges;
}

/**
 * Checkpoint ids grouped by depth: the length of the longest `requires`
 * chain beneath each. Unknown requires are ignored and a cycle is cut.
 */
function depthRows(checkpoints: Checkpoint[]): string[][] {
  const byId = new Map(checkpoints.map(c => [c.id, c]));
  const rowOf = new Map<string, number>();

  const rowFor = (id: string, path: Set<string>): number => {
    const known = rowOf.get(id);
    if (known !== undefined) return known;
    const requires = (byId.get(id)?.requires || []).filter(
      r => byId.has(r) && !path.has(r)
    );
    const row = requires.length
      ? 1 + Math.max(...requires.map(r => rowFor(r, new Set(path).add(id))))
      : 0;
    rowOf.set(id, row);
    return row;
  };
  checkpoints.forEach(c => rowFor(c.id, new Set([c.id])));

  const rows: string[][] = [];
  for (const c of checkpoints) {
    const row = rowOf.get(c.id) || 0;
    (rows[row] ||= []).push(c.id);
  }
  return rows;
}

/**
 * Checkpoints on rings around the root, one ring per depth, each ring just
 * wide enough for its nodes. A node sits near the mean angle of its
 * parents, so a branch stays in its own sector; a ring's nodes are then
 * spread evenly, keeping that order.
 */
export function layoutRadial(
  checkpoints: Checkpoint[],
  spacing = NORMAL_SPACING
): MapLayout {
  const byId = new Map(checkpoints.map(c => [c.id, c]));
  const rows = depthRows(checkpoints);
  const weight = subtreeSizes(checkpoints);
  const radii: number[] = [];
  rows.forEach((ids, depth) => {
    const fitsNodes = (ids.length * spacing.column) / TAU;
    const previous = depth === 0 ? 0 : radii[depth - 1] + spacing.ring;
    radii.push(
      ids.length === 1 && depth === 0 ? 0 : Math.max(previous, fitsNodes)
    );
  });
  const outer = radii[radii.length - 1] + RADIAL_MARGIN;
  const center = outer;

  const angleOf = new Map<string, number>();
  const nodes: {[id: string]: NodePosition} = {};
  rows.forEach((ids, depth) => {
    // Preferred angle: the circular mean of the parents' angles. Nodes with
    // no placed parent, the first ring in particular, divide the circle
    // from the top in authored order, each taking a sector as wide as the
    // part of the pathway beneath it.
    const free = ids.filter(
      id => !(byId.get(id)?.requires || []).some(p => angleOf.has(p))
    );
    const total = free.reduce((s, id) => s + weight.get(id)!, 0);
    const sectorCenter = new Map<string, number>();
    let before = 0;
    for (const id of free) {
      const w = weight.get(id)!;
      sectorCenter.set(id, -TAU / 4 + (TAU * (before + w / 2)) / total);
      before += w;
    }
    const preferred = ids.map(id => {
      const parents = (byId.get(id)?.requires || []).filter(p =>
        angleOf.has(p)
      );
      if (!parents.length) return sectorCenter.get(id)!;
      const x = parents.reduce((s, p) => s + Math.cos(angleOf.get(p)!), 0);
      const y = parents.reduce((s, p) => s + Math.sin(angleOf.get(p)!), 0);
      return Math.atan2(y, x);
    });
    // Sort by preferred angle, cutting the circle at the widest gap so the
    // order does not wrap through a crowded sector. Each node then takes
    // its preferred angle, nudged only where neighbours would come closer
    // than a node's width along the ring. A ring too full for that is
    // spread evenly instead.
    const order = ids
      .map((_, i) => i)
      .sort((p, q) => preferred[p] - preferred[q]);
    const gapAfter = (k: number) =>
      k + 1 < order.length
        ? preferred[order[k + 1]] - preferred[order[k]]
        : preferred[order[0]] + TAU - preferred[order[k]];
    const cut =
      (order.reduce((w, _, k) => (gapAfter(k) > gapAfter(w) ? k : w), 0) + 1) %
      order.length;
    const sorted = [...order.slice(cut), ...order.slice(0, cut)];
    let prev = -Infinity;
    const wish = sorted.map(idx => {
      let p = preferred[idx];
      while (p < prev) p += TAU;
      prev = p;
      return p;
    });
    const minSep = radii[depth] > 0 ? spacing.column / radii[depth] : 0;
    const nudged = nudgeApart(wish, minSep);
    const tooFull = nudged[nudged.length - 1] - nudged[0] > TAU - minSep;
    const step = TAU / ids.length;
    const phase = wish.reduce((s, p, k) => s + (p - k * step), 0) / wish.length;
    const angles = tooFull ? wish.map((_, k) => phase + k * step) : nudged;
    sorted.forEach((idx, k) => {
      const id = ids[idx];
      const angle = ids.length === 1 && depth === 0 ? 0 : angles[k];
      // A node at the center has no direction for its children to follow.
      if (radii[depth] > 0) angleOf.set(id, angle);
      nodes[id] = {
        id,
        row: depth,
        x: Math.round(center + radii[depth] * Math.cos(angle)),
        y: Math.round(center + radii[depth] * Math.sin(angle)),
      };
    });
  });

  return {
    nodes,
    edges: edgesOf(checkpoints),
    width: 2 * outer,
    height: 2 * outer,
    rings: {x: center, y: center, radii: radii.filter(r => r > 0)},
    spacing,
  };
}

/** Each checkpoint with how many checkpoints depend on it, itself included. */
function subtreeSizes(checkpoints: Checkpoint[]): Map<string, number> {
  const children = new Map<string, string[]>();
  for (const c of checkpoints) {
    for (const r of c.requires || []) {
      (children.get(r) ?? children.set(r, []).get(r)!).push(c.id);
    }
  }
  const sizes = new Map<string, number>();
  for (const c of checkpoints) {
    const seen = new Set<string>([c.id]);
    const stack = [c.id];
    for (let id = stack.pop(); id !== undefined; id = stack.pop()) {
      for (const child of children.get(id) || []) {
        if (!seen.has(child)) {
          seen.add(child);
          stack.push(child);
        }
      }
    }
    sizes.set(c.id, seen.size);
  }
  return sizes;
}

/**
 * Positions along a line for sorted wishes, each at least `minSep` from
 * the next. Neighbours that would be closer merge into a run spaced at
 * `minSep` and centered on the mean of their wishes, which moves them the
 * least; a run that then crowds the one before it merges with that too.
 */
function nudgeApart(wish: number[], minSep: number): number[] {
  const runs: {start: number; count: number; sum: number}[] = [];
  for (const w of wish) {
    let run = {start: w, count: 1, sum: w};
    while (runs.length) {
      const last = runs[runs.length - 1];
      if (run.start >= last.start + last.count * minSep) break;
      runs.pop();
      const count = last.count + run.count;
      const sum = last.sum + run.sum;
      run = {start: sum / count - ((count - 1) * minSep) / 2, count, sum};
    }
    runs.push(run);
  }
  return runs.flatMap(r =>
    Array.from({length: r.count}, (_, i) => r.start + i * minSep)
  );
}

/**
 * Checkpoints in rows by depth, roots on top, or at the bottom when
 * `upward`, so every edge points the same way.
 */
export function layoutCheckpoints(
  checkpoints: Checkpoint[],
  spacing = NORMAL_SPACING,
  upward = false
): MapLayout {
  const rows = depthRows(checkpoints);

  // A row of n nodes has n + 1 gaps, so this keeps neighbours a spacing apart.
  const width = Math.max(
    BOARD_WIDTH,
    spacing.column * (1 + Math.max(...rows.map(ids => ids.length)))
  );
  const nodes: {[id: string]: NodePosition} = {};
  rows.forEach((ids, row) => {
    ids.forEach((id, i) => {
      nodes[id] = {
        id,
        row,
        x: Math.round((width * (i + 1)) / (ids.length + 1)),
        y: TOP_MARGIN + (upward ? rows.length - 1 - row : row) * spacing.row,
      };
    });
  });

  return {
    nodes,
    edges: edgesOf(checkpoints),
    width,
    height: TOP_MARGIN + (rows.length - 1) * spacing.row + BOTTOM_MARGIN,
    spacing,
  };
}
