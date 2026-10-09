// Edge routes for the grid layout. Lines run center to center so they
// emerge from under the circles. An elbow between non-neighbours travels
// only through the gaps between cells, and where elbows share a stretch of
// gap they are drawn as one line, so a shared trunk reads as one.

import {Edge, MapLayout} from './layout';
import {EdgeShape} from './uiVariants';

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
 * What to draw for a grid layout's edges. Neighbours, diagonal ones too,
 * connect directly. Farther apart, an elbow leaves the parent sideways into
 * the next column gap, runs there to the row gap beside the child, crosses
 * to the child's column and enters it. Curves bend between rows instead.
 * Elbow pieces that coincide are returned once, carrying every edge.
 */
export function gridRoutes(layout: MapLayout, shape: EdgeShape): DrawnEdge[] {
  const drawn: DrawnEdge[] = [];
  const segments: Segment[] = [];
  const {column, row} = layout.spacing;
  for (const edge of layout.edges) {
    const a = layout.nodes[edge.from];
    const b = layout.nodes[edge.to];
    const key = `${edge.from}-${edge.to}`;
    const adjacent =
      Math.abs(b.x - a.x) <= column && Math.abs(b.y - a.y) <= row;
    if (shape === 'straight' || adjacent) {
      drawn.push({key, d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`, edges: [edge]});
    } else if (shape === 'curve') {
      const mid = (a.y + b.y) / 2;
      drawn.push({
        key,
        d: `M ${a.x} ${a.y} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`,
        edges: [edge],
      });
    } else {
      const dx = Math.sign(b.x - a.x) || 1;
      const dy = Math.sign(b.y - a.y) || -1;
      const gapX = a.x + dx * (column / 2);
      const gapY = b.y - dy * (row / 2);
      const corners = [
        [a.x, a.y],
        [gapX, a.y],
        [gapX, gapY],
        [b.x, gapY],
        [b.x, b.y],
      ];
      for (let i = 1; i < corners.length; i++) {
        const [x1, y1] = corners[i - 1];
        const [x2, y2] = corners[i];
        if (x1 !== x2 || y1 !== y2) segments.push({x1, y1, x2, y2, edge});
      }
    }
  }
  return [...drawn, ...mergeSegments(segments)];
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
