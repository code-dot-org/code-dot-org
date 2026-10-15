import {Checkpoint} from '@cdo/apps/adaptive/types';
import {
  MapLayout,
  layoutCheckpoints,
  layoutCity,
  turnLayout,
  layoutCluster,
  layoutHoneycomb,
  layoutRadial,
} from '@cdo/apps/adaptive/views/layout';

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

describe('layoutCheckpoints', () => {
  it('puts roots on the first row and children one row per requires depth', () => {
    const layout = layoutCheckpoints([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
      checkpoint('c', ['a', 'root']),
    ]);
    expect(layout.nodes.root.row).toBe(0);
    expect(layout.nodes.a.row).toBe(1);
    expect(layout.nodes.b.row).toBe(1);
    expect(layout.nodes.c.row).toBe(2);
    expect(layout.edges).toEqual([
      {from: 'root', to: 'a'},
      {from: 'root', to: 'b'},
      {from: 'a', to: 'c'},
      {from: 'root', to: 'c'},
    ]);
  });

  it('spreads a row evenly across the board width', () => {
    const layout = layoutCheckpoints([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
    ]);
    expect(layout.nodes.root.x).toBe(layout.width / 2);
    expect(layout.nodes.a.x).toBeLessThan(layout.nodes.b.x);
    expect(layout.nodes.a.x + layout.nodes.b.x).toBe(layout.width);
    expect(layout.nodes.a.y).toBe(layout.nodes.b.y);
    expect(layout.nodes.a.y).toBeGreaterThan(layout.nodes.root.y);
  });

  it('puts roots at the bottom when growing upward', () => {
    const checkpoints = [
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['a']),
    ];
    const down = layoutCheckpoints(checkpoints);
    const up = layoutCheckpoints(checkpoints, undefined, true);
    expect(up.nodes.root.y).toBe(down.nodes.b.y);
    expect(up.nodes.b.y).toBe(down.nodes.root.y);
    expect(up.nodes.a.y).toBe(down.nodes.a.y);
    expect(up.height).toBe(down.height);
  });

  it('widens the board for a row too crowded for its labels', () => {
    const narrow = layoutCheckpoints([checkpoint('root')]);
    const wide = layoutCheckpoints([
      checkpoint('root'),
      ...['a', 'b', 'c', 'd', 'e'].map(id => checkpoint(id, ['root'])),
    ]);
    expect(wide.width).toBeGreaterThan(narrow.width);
    expect(wide.nodes.b.x - wide.nodes.a.x).toBeGreaterThanOrEqual(190);
  });

  it('ignores unknown requires and survives a cycle', () => {
    const layout = layoutCheckpoints([
      checkpoint('a', ['b', 'nowhere']),
      checkpoint('b', ['a']),
    ]);
    expect(Object.keys(layout.nodes).sort()).toEqual(['a', 'b']);
    expect(layout.edges).toEqual([
      {from: 'b', to: 'a'},
      {from: 'a', to: 'b'},
    ]);
  });
});

describe('layoutRadial', () => {
  const dist = (a: {x: number; y: number}, b: {x: number; y: number}) =>
    Math.hypot(a.x - b.x, a.y - b.y);
  const angleIn = (layout: MapLayout, id: string) =>
    Math.atan2(
      layout.nodes[id].y - layout.height / 2,
      layout.nodes[id].x - layout.width / 2
    );
  const distIn = (layout: MapLayout, id: string) =>
    dist(layout.nodes[id], {x: layout.width / 2, y: layout.height / 2});

  it('puts the root at the center and each depth on its own ring', () => {
    const layout = layoutRadial([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
      checkpoint('c', ['a']),
    ]);
    const center = {x: layout.width / 2, y: layout.height / 2};
    expect(layout.nodes.root).toMatchObject(center);
    expect(dist(layout.nodes.a, center)).toBeCloseTo(
      dist(layout.nodes.b, center),
      0
    );
    expect(dist(layout.nodes.c, center)).toBeGreaterThan(
      dist(layout.nodes.a, center)
    );
  });

  it('puts an only child straight outside its parent when there is room', () => {
    const layout = layoutRadial([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
      checkpoint('c', ['a']),
    ]);
    expect(angleIn(layout, 'c')).toBeCloseTo(angleIn(layout, 'a'), 5);
    expect(distIn(layout, 'c')).toBeGreaterThan(distIn(layout, 'a'));
  });

  it('nudges ring neighbours apart only as far as a node width', () => {
    // Four children of one parent all wish for the same angle.
    const layout = layoutRadial([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
      ...['c', 'd', 'e', 'f'].map(id => checkpoint(id, ['a'])),
    ]);
    const center = {x: layout.width / 2, y: layout.height / 2};
    const angle = (id: string) =>
      Math.atan2(layout.nodes[id].y - center.y, layout.nodes[id].x - center.x);
    const angles = ['c', 'd', 'e', 'f'].map(angle).sort((p, q) => p - q);
    const radius = Math.hypot(
      layout.nodes.c.x - center.x,
      layout.nodes.c.y - center.y
    );
    for (let i = 1; i < angles.length; i++) {
      expect((angles[i] - angles[i - 1]) * radius).toBeCloseTo(200, -1);
    }
    // Centered on the parent's angle.
    expect((angles[1] + angles[2]) / 2).toBeCloseTo(angle('a'), 1);
  });

  it('gives a first-ring node a sector as wide as what depends on it', () => {
    // a carries three descendants, b and c none, so a's sector is four
    // times theirs: b and c sit as close as the ring allows, far from a.
    const layout = layoutRadial([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
      checkpoint('c', ['root']),
      checkpoint('d', ['a']),
      checkpoint('e', ['a']),
      checkpoint('f', ['d']),
    ]);
    const apart = (p: string, q: string) => {
      const d = Math.abs(angleIn(layout, p) - angleIn(layout, q));
      return Math.min(d, 2 * Math.PI - d);
    };
    // One node width along a 140px ring.
    expect(apart('b', 'c')).toBeCloseTo(200 / 140, 2);
    expect(apart('a', 'b')).toBeGreaterThan(2);
    expect(apart('a', 'c')).toBeGreaterThan(2);
  });

  it("keeps a child nearer its parent than its parent's sibling", () => {
    const layout = layoutRadial([
      checkpoint('root'),
      checkpoint('a', ['root']),
      checkpoint('b', ['root']),
      checkpoint('c', ['a']),
      checkpoint('d', ['b']),
    ]);
    expect(dist(layout.nodes.c, layout.nodes.a)).toBeLessThan(
      dist(layout.nodes.c, layout.nodes.b)
    );
    expect(dist(layout.nodes.d, layout.nodes.b)).toBeLessThan(
      dist(layout.nodes.d, layout.nodes.a)
    );
  });
});

describe('layoutCluster', () => {
  it('starts in the middle and spirals outward in authored order', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    const layout = layoutCluster(ids.map(id => checkpoint(id)));
    const center = layout.nodes.a;
    expect(center.x).toBe(layout.width / 2);
    expect(center.row).toBe(1);
    // The next eight fill the ring around it, starting straight above.
    expect(layout.nodes.b).toMatchObject({x: center.x, row: 0});
    const ring = ids.slice(1).map(id => layout.nodes[id]);
    expect(
      ring.every(
        n => Math.max(Math.abs(n.x - center.x) / 200, Math.abs(n.row - 1)) === 1
      )
    ).toBe(true);
  });
});

describe('layoutHoneycomb', () => {
  it('rings the first checkpoint with the next six, all one step away', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const layout = layoutHoneycomb(ids.map(id => checkpoint(id)));
    const center = layout.nodes.a;
    const step = 200 * 0.7;
    for (const id of ids.slice(1, 7)) {
      const n = layout.nodes[id];
      // Positions are rounded to whole pixels.
      expect(Math.hypot(n.x - center.x, n.y - center.y)).toBeCloseTo(step, -1);
    }
    // Pointy-topped cells have no neighbour straight above: b, first
    // clockwise from the top, is up and to the right. h starts the second
    // ring, two steps out.
    expect(layout.nodes.b.x).toBeGreaterThan(center.x);
    expect(layout.nodes.b.y).toBeLessThan(center.y);
    const h = layout.nodes.h;
    expect(Math.hypot(h.x - center.x, h.y - center.y)).toBeGreaterThan(
      1.5 * step
    );
  });
});

describe('layoutCity', () => {
  // The playtest pathway: three children of the start, one checkpoint on
  // two of them, and two single-parent chains.
  const pathway = [
    checkpoint('intro'),
    checkpoint('details', ['intro']),
    checkpoint('tweak', ['intro']),
    checkpoint('edit', ['intro']),
    checkpoint('spot', ['details', 'tweak']),
    checkpoint('whats', ['spot']),
    checkpoint('speak', ['clue']),
    checkpoint('clue', ['edit']),
  ];
  const cellsOf = (layout: MapLayout) => {
    const {column, row} = layout.spacing;
    const origin = layout.nodes.intro;
    return Object.fromEntries(
      Object.values(layout.nodes).map(n => [
        n.id,
        {col: (n.x - origin.x) / column, row: (n.y - origin.y) / row},
      ])
    );
  };
  const touching = (
    a: {col: number; row: number},
    b: {col: number; row: number}
  ) => Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row)) === 1;

  it('puts every checkpoint in a cell touching each of its parents', () => {
    const cells = cellsOf(layoutCity(pathway));
    for (const c of pathway) {
      for (const parent of c.requires || []) {
        expect(touching(cells[c.id], cells[parent])).toBe(true);
      }
    }
  });

  it("gives the start's children edges and a two-parent child the corner between", () => {
    const cells = cellsOf(layoutCity(pathway));
    for (const id of ['details', 'tweak', 'edit']) {
      expect(cells[id].col === 0 || cells[id].row === 0).toBe(true);
    }
    expect(Math.abs(cells.spot.col)).toBe(1);
    expect(Math.abs(cells.spot.row)).toBe(1);
  });

  it('turned a quarter turn, moves what was above the root to its right', () => {
    const flat = layoutCity(pathway);
    const turned = turnLayout(flat);
    // details was straight above intro.
    expect(flat.nodes.details.x).toBe(flat.nodes.intro.x);
    expect(flat.nodes.details.y).toBeLessThan(flat.nodes.intro.y);
    expect(turned.nodes.details.y).toBe(turned.nodes.intro.y);
    expect(turned.nodes.details.x).toBeGreaterThan(turned.nodes.intro.x);
    // Neighbours stay one cell apart under the swapped spacing.
    expect(turned.nodes.details.x - turned.nodes.intro.x).toBe(
      turned.spacing.column
    );
    expect(turned.spacing.column).toBe(flat.spacing.row);
    for (const n of Object.values(turned.nodes)) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.y).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(turned.width);
      expect(n.y).toBeLessThan(turned.height);
    }
  });

  it('fills the first ring before growing into the next', () => {
    const cells = cellsOf(layoutCity(pathway));
    const ring = (id: string) =>
      Math.max(Math.abs(cells[id].col), Math.abs(cells[id].row));
    expect(ring('clue')).toBe(1);
    expect(ring('whats')).toBe(2);
    expect(ring('speak')).toBe(2);
    // Eight distinct cells.
    expect(
      new Set(Object.values(cells).map(c => `${c.col},${c.row}`)).size
    ).toBe(8);
  });

  it('lays an opening chain down a column and grows from where it branches', () => {
    const chained = [
      checkpoint('welcome'),
      checkpoint('idea', ['welcome']),
      checkpoint('prompt', ['idea']),
      checkpoint('a', ['prompt']),
      checkpoint('b', ['prompt']),
      checkpoint('c', ['prompt']),
      checkpoint('d', ['a', 'b']),
    ];
    const layout = layoutCity(chained);
    const origin = layout.nodes.welcome;
    const cell = (id: string) => ({
      col: (layout.nodes[id].x - origin.x) / layout.spacing.column,
      row: (layout.nodes[id].y - origin.y) / layout.spacing.row,
    });
    expect(cell('idea')).toEqual({col: 0, row: 1});
    expect(cell('prompt')).toEqual({col: 0, row: 2});
    for (const id of ['a', 'b', 'c']) {
      expect(touching(cell(id), cell('prompt'))).toBe(true);
      // Edges of the branch point, none of them back up the spine.
      expect(cell(id).col === 0 || cell(id).row === 2).toBe(true);
      expect(cell(id)).not.toEqual({col: 0, row: 1});
    }
    expect(touching(cell('d'), cell('a'))).toBe(true);
    expect(touching(cell('d'), cell('b'))).toBe(true);
  });

  it('grows around the start itself when it branches at once', () => {
    const cells = cellsOf(layoutCity(pathway));
    // A child above the start: no spine was laid.
    expect(cells.details).toEqual({col: 0, row: -1});
  });
});
