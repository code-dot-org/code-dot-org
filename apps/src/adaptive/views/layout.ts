// Places checkpoints on the map. The tree puts roots on top, a checkpoint's
// row being the length of the longest `requires` chain beneath it, so every
// edge points downward. The destinations grid puts the root at the center
// and the checkpoints with a `destination` in stacks around the outside.

import {Checkpoint} from '../types';

export const NODE_RADIUS = 34;
export const BOARD_WIDTH = 760;
const TAU = 2 * Math.PI;
const ROW_HEIGHT = 170;
const TOP_MARGIN = 96;
const BOTTOM_MARGIN = 60;
// A destinations grid cell holds a circle with two lines of title below it.
const CELL_WIDTH = 120;
const CELL_HEIGHT = 110;
// Around the grid: above for the group boxes and their titles, below for a
// title under the last row, beside for a member's title next to it.
const GRID_TOP_MARGIN = TOP_MARGIN + 40;
const GRID_BOTTOM_MARGIN = BOTTOM_MARGIN + 24;
const GRID_SIDE_MARGIN = 180;

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

/** The checkpoints that share a `destination`, in authored order. */
export interface DestinationGroup {
  title: string;
  ids: string[];
}

export interface MapLayout {
  nodes: {[id: string]: NodePosition};
  edges: Edge[];
  width: number;
  height: number;
  /** Distance between neighbouring cells of a destinations grid. */
  cell?: {width: number; height: number};
  /** The destination groups of a destinations grid, in authored order. */
  destinations?: DestinationGroup[];
}

/** Checkpoints in rows by depth, roots on top. */
export function layoutCheckpoints(checkpoints: Checkpoint[]): MapLayout {
  const rows = depthRows(checkpoints);
  const nodes: {[id: string]: NodePosition} = {};
  rows.forEach((ids, row) => {
    ids.forEach((id, i) => {
      nodes[id] = {
        id,
        row,
        x: Math.round((BOARD_WIDTH * (i + 1)) / (ids.length + 1)),
        y: TOP_MARGIN + row * ROW_HEIGHT,
      };
    });
  });
  return {
    nodes,
    edges: edgesOf(checkpoints),
    width: BOARD_WIDTH,
    height: TOP_MARGIN + (rows.length - 1) * ROW_HEIGHT + BOTTOM_MARGIN,
  };
}

type Cell = {col: number; row: number};
const cellKey = (c: Cell) => `${c.col},${c.row}`;

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

  destinationStacks(groups, turns).forEach((stack, side) => {
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
    ringCells(k).filter(c => Math.abs(c.col) <= half && !taken.has(cellKey(c)));
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
      x: GRID_SIDE_MARGIN + CELL_WIDTH * (col - minCol),
      y: GRID_TOP_MARGIN + CELL_HEIGHT * (row - minRow),
    };
  });
  return {
    nodes,
    edges: edgesOf(checkpoints),
    width: 2 * GRID_SIDE_MARGIN + CELL_WIDTH * (maxCol - minCol),
    height:
      GRID_TOP_MARGIN + CELL_HEIGHT * (maxRow - minRow) + GRID_BOTTOM_MARGIN,
    cell: {width: CELL_WIDTH, height: CELL_HEIGHT},
    destinations: groups,
  };
}

/** The cells at Chebyshev distance `k` from the center, clockwise from the top. */
function ringCells(k: number): Cell[] {
  if (k === 0) return [{col: 0, row: 0}];
  const ring: Cell[] = [];
  for (let col = -k; col <= k; col++) {
    for (let row = -k; row <= k; row++) {
      if (Math.max(Math.abs(col), Math.abs(row)) === k) ring.push({col, row});
    }
  }
  const angle = (c: Cell) => (Math.atan2(c.col, -c.row) + TAU) % TAU;
  return ring.sort((p, q) => angle(p) - angle(q));
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
  if (!clockwise.length) return [[], []];
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
