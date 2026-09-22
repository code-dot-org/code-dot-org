// Places checkpoints on a top-to-bottom map. A checkpoint's row is the
// length of the longest `requires` chain beneath it, so roots sit on top and
// every edge points downward.

import {Checkpoint} from './types';

export const NODE_RADIUS = 34;
export const BOARD_WIDTH = 760;
const ROW_HEIGHT = 170;
const TOP_MARGIN = 96;
const BOTTOM_MARGIN = 60;

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
}

export function layoutCheckpoints(checkpoints: Checkpoint[]): MapLayout {
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

  const edges: Edge[] = [];
  for (const c of checkpoints) {
    for (const r of c.requires || []) {
      if (byId.has(r)) edges.push({from: r, to: c.id});
    }
  }

  return {
    nodes,
    edges,
    width: BOARD_WIDTH,
    height: TOP_MARGIN + (rows.length - 1) * ROW_HEIGHT + BOTTOM_MARGIN,
  };
}
