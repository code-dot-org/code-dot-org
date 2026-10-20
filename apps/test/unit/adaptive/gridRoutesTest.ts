import {Checkpoint} from '@cdo/apps/adaptive/types';
import {busRoutes, gridRoutes} from '@cdo/apps/adaptive/views/gridRoutes';
import {Edge, MapLayout, layoutCluster} from '@cdo/apps/adaptive/views/layout';

const checkpoint = (id: string, requires?: string[]): Checkpoint => ({
  id,
  title: id,
  description: id,
  requires,
  steps: [
    {
      id: `${id}-step`,
      title: id,
      kind: 'panels',
      panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
    },
  ],
});

// a in the middle, b..i around it clockwise from the top, then j and k on
// the outer ring above b, both two rows up from a.
const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
const layout = () =>
  layoutCluster(ids.map(id => checkpoint(id, id === 'a' ? undefined : ['a'])));

describe('gridRoutes', () => {
  it('connects neighbours directly and routes others through the gaps', () => {
    const lines = gridRoutes(layout(), 'elbow');
    const direct = lines.find(l => l.key === 'a-b')!;
    expect(direct.d).toMatch(/^M \d+ \d+ L \d+ \d+$/);
    const pieces = lines.filter(l => l.edges.some(e => e.to === 'k'));
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.every(l => /^M \d+ \d+ [HV] \d+$/.test(l.d))).toBe(true);
  });

  it('draws a stretch two edges share once, carrying both', () => {
    const lines = gridRoutes(layout(), 'elbow');
    const shared = lines.filter(
      l => l.edges.some(e => e.to === 'j') && l.edges.some(e => e.to === 'k')
    );
    expect(shared.length).toBeGreaterThan(0);
    // No two drawn pieces coincide.
    const ds = lines.map(l => l.d);
    expect(new Set(ds).size).toBe(ds.length);
  });
});

describe('busRoutes', () => {
  // Cells 100 apart, cell (0, 0) at (500, 500).
  const grid = (
    cells: {[id: string]: [number, number]},
    edges: Edge[]
  ): MapLayout => ({
    nodes: Object.fromEntries(
      Object.entries(cells).map(([id, [col, row]]) => [
        id,
        {id, x: 100 * (col + 5), y: 100 * (row + 5), row},
      ])
    ),
    edges,
    width: 1000,
    height: 1000,
    spacing: {column: 100, row: 100, ring: 100},
  });
  const ds = (lines: ReturnType<typeof busRoutes>) => lines.map(l => l.d);

  it("runs along the parent's column then the child's row, unless that crosses a checkpoint", () => {
    const edges = [{from: 'p', to: 'c'}];
    expect(ds(busRoutes(grid({p: [0, 0], c: [2, 1]}, edges), {}))).toEqual([
      'M 500 500 V 600',
      'M 500 600 H 700',
    ]);
    const blocked = grid({p: [0, 0], c: [2, 1], other: [1, 1]}, edges);
    expect(ds(busRoutes(blocked, {}))).toEqual([
      'M 500 500 H 700',
      'M 700 500 V 600',
    ]);
  });

  it('joins a group beside the parent when its rows are blocked, running down the trunk', () => {
    const layout = grid(
      {m1: [-3, 1], m2: [-3, 2], m3: [-3, 3], p: [1, -1], other: [1, 1]},
      [{from: 'p', to: 'm1'}]
    );
    const trunkOf = {m1: 260, m2: 260, m3: 260};
    expect(ds(busRoutes(layout, trunkOf))).toEqual([
      'M 260 400 H 600',
      'M 260 400 V 600',
      'M 200 600 H 260',
    ]);
  });

  it('joins a group at its nearest clear row and feeds the member off the trunk', () => {
    const layout = grid(
      {m1: [-3, -1], m2: [-3, 0], m3: [-3, 1], p: [0, 0], other: [-1, 0]},
      [{from: 'p', to: 'm2'}]
    );
    const trunk = 260;
    const trunkOf = {m1: trunk, m2: trunk, m3: trunk};
    // The member's own row is blocked, so the line joins one row up.
    expect(ds(busRoutes(layout, trunkOf))).toEqual([
      'M 500 400 V 500',
      'M 260 400 H 500',
      'M 260 400 V 500',
      'M 200 500 H 260',
    ]);
  });

  it('shares the approach between members of a group, carrying both edges', () => {
    const layout = grid({m1: [-3, -1], m2: [-3, 0], m3: [-3, 1], p: [0, 0]}, [
      {from: 'p', to: 'm1'},
      {from: 'p', to: 'm3'},
    ]);
    const trunkOf = {m1: 260, m2: 260, m3: 260};
    const lines = busRoutes(layout, trunkOf);
    const approach = lines.find(l => l.d === 'M 260 500 H 500')!;
    expect(approach.edges.map(e => e.to)).toEqual(['m1', 'm3']);
    expect(lines.find(l => l.d === 'M 260 400 V 500')!.edges).toEqual([
      {from: 'p', to: 'm1'},
    ]);
  });
});
