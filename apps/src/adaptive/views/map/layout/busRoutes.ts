// Lines for the destinations grid. Every line runs along the parent's column
// to a row and then along that row, so the map reads as roads out of each
// checkpoint, and lines that share a stretch of road are drawn once.

import {Edge, MapLayout, NodePosition} from './types';

/** One line to draw, and the edges it carries. */
export interface DrawnEdge {
  key: string;
  d: string;
  edges: Edge[];
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  edge: Edge;
}

/**
 * A line into a destination runs to the group's trunk, a vertical line
 * just outside its box at `trunkOf[member]`, and the trunk feeds each
 * member through a short stub; parents feeding the same group share it.
 * The row is the one that crosses the fewest other checkpoints, counting
 * the cell the line turns in, then the nearest to the parent, preferring
 * the group's own rows: a row outside them sends the trunk along the side
 * of the map to reach the group. A line to any other child turns once, in
 * whichever order crosses fewer checkpoints. Pieces that coincide are
 * returned once, carrying every edge.
 */
export function busRoutes(
  layout: MapLayout,
  trunkOf: {[id: string]: number}
): DrawnEdge[] {
  const {width: column, height: row} = layout.cell!;
  const nodes = Object.values(layout.nodes);
  const minX = Math.min(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const colOf = (x: number) => Math.round((x - minX) / column);
  const rowOf = (y: number) => Math.round((y - minY) / row);
  const rowY = (r: number) => minY + r * row;
  const occupied = new Set(nodes.map(n => `${colOf(n.x)},${rowOf(n.y)}`));
  const rows = [...new Set(nodes.map(n => rowOf(n.y)))].sort((p, q) => p - q);
  // Checkpoints strictly between two cells of a column or a row.
  const between = (a: number, b: number, fixed: number, vertical: boolean) => {
    let n = 0;
    for (let i = Math.min(a, b) + 1; i < Math.max(a, b); i++) {
      if (occupied.has(vertical ? `${fixed},${i}` : `${i},${fixed}`)) n++;
    }
    return n;
  };
  // Checkpoints a line from cell a crosses running along a's column to
  // row r and then along row r to column c, counting the turn cell.
  const crossings = (a: NodePosition, r: number, c: number) => {
    const aCol = colOf(a.x);
    const aRow = rowOf(a.y);
    const turn = r !== aRow && occupied.has(`${aCol},${r}`) ? 1 : 0;
    return between(aRow, r, aCol, true) + turn + between(aCol, c, r, false);
  };

  const segments: Segment[] = [];
  const segment = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    edge: Edge
  ) => {
    if (x1 !== x2 || y1 !== y2) segments.push({x1, y1, x2, y2, edge});
  };

  const membersOf = new Map<number, NodePosition[]>();
  for (const n of nodes) {
    const trunk = trunkOf[n.id];
    if (trunk !== undefined) {
      membersOf.set(trunk, [...(membersOf.get(trunk) || []), n]);
    }
  }
  // Edges into a group, together per parent and group.
  const intoGroups = new Map<string, Edge[]>();
  for (const edge of layout.edges) {
    const trunk = trunkOf[edge.to];
    if (trunk === undefined) {
      routeDirect(edge);
      continue;
    }
    const key = `${edge.from}@${trunk}`;
    intoGroups.set(key, [...(intoGroups.get(key) || []), edge]);
  }

  function routeDirect(edge: Edge) {
    const a = layout.nodes[edge.from];
    const b = layout.nodes[edge.to];
    if (a.x === b.x || a.y === b.y) {
      segment(a.x, a.y, b.x, b.y, edge);
      return;
    }
    const down = crossings(a, rowOf(b.y), colOf(b.x));
    const across = crossings(b, rowOf(a.y), colOf(a.x));
    if (down <= across) {
      segment(a.x, a.y, a.x, b.y, edge);
      segment(a.x, b.y, b.x, b.y, edge);
    } else {
      segment(a.x, a.y, b.x, a.y, edge);
      segment(b.x, a.y, b.x, b.y, edge);
    }
  }

  for (const edges of intoGroups.values()) {
    const a = layout.nodes[edges[0].from];
    const trunk = trunkOf[edges[0].to];
    const members = membersOf.get(trunk)!;
    const fed = edges.map(e => layout.nodes[e.to]);
    const aRow = rowOf(a.y);
    const memberCol = colOf(members[0].x);
    const first = Math.min(...members.map(m => rowOf(m.y)));
    const last = Math.max(...members.map(m => rowOf(m.y)));
    const outside = (r: number) =>
      r < first ? 3 + first - r : r > last ? 3 + r - last : 0;
    const cost = (r: number) =>
      10 * crossings(a, r, memberCol) + Math.abs(r - aRow) + outside(r);
    const joinRow = [...rows]
      .sort((p, q) => Math.abs(p - aRow) - Math.abs(q - aRow))
      .reduce((best, r) => (cost(r) < cost(best) ? r : best));
    const joinY = rowY(joinRow);
    for (const edge of edges) {
      segment(a.x, a.y, a.x, joinY, edge);
      segment(a.x, joinY, trunk, joinY, edge);
    }
    edges.forEach((edge, i) => {
      segment(trunk, joinY, trunk, fed[i].y, edge);
      segment(trunk, fed[i].y, fed[i].x, fed[i].y, edge);
    });
  }
  return mergeSegments(segments);
}

// Axis-aligned segments split at every endpoint on their line, so that
// pieces two edges share are identical, then deduplicated.
function mergeSegments(segments: Segment[]): DrawnEdge[] {
  // Line key => sorted breakpoints along it.
  const breaks = new Map<string, Set<number>>();
  const lineOf = (s: Segment) => (s.x1 === s.x2 ? `v${s.x1}` : `h${s.y1}`);
  for (const s of segments) {
    const line = lineOf(s);
    const set = breaks.get(line) ?? breaks.set(line, new Set()).get(line)!;
    if (s.x1 === s.x2) set.add(s.y1).add(s.y2);
    else set.add(s.x1).add(s.x2);
  }
  const pieces = new Map<string, DrawnEdge>();
  for (const s of segments) {
    const vertical = s.x1 === s.x2;
    const [lo, hi] = vertical
      ? [Math.min(s.y1, s.y2), Math.max(s.y1, s.y2)]
      : [Math.min(s.x1, s.x2), Math.max(s.x1, s.x2)];
    const stops = [...breaks.get(lineOf(s))!]
      .filter(t => t >= lo && t <= hi)
      .sort((p, q) => p - q);
    for (let i = 1; i < stops.length; i++) {
      const d = vertical
        ? `M ${s.x1} ${stops[i - 1]} V ${stops[i]}`
        : `M ${stops[i - 1]} ${s.y1} H ${stops[i]}`;
      const piece = pieces.get(d);
      if (piece) piece.edges.push(s.edge);
      else pieces.set(d, {key: d, d, edges: [s.edge]});
    }
  }
  return [...pieces.values()];
}
