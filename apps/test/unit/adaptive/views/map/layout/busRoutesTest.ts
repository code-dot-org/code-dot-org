import {busRoutes} from '@cdo/apps/adaptive/views/map/layout/busRoutes';
import {Edge, MapLayout} from '@cdo/apps/adaptive/views/map/layout/types';

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
  cell: {width: 100, height: 100},
});
const ds = (lines: ReturnType<typeof busRoutes>) => lines.map(l => l.d);

describe('busRoutes', () => {
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
