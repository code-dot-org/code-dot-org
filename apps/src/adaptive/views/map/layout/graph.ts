import {Checkpoint} from '../../../types';

import {Edge} from './types';

/** One edge per known `requires`, parent to child. */
export function edgesOf(checkpoints: Checkpoint[]): Edge[] {
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
export function depthRows(checkpoints: Checkpoint[]): string[][] {
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
