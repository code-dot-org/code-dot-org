import {Checkpoint} from '@cdo/apps/adaptive/types';
import {layoutDestinations} from '@cdo/apps/adaptive/views/map/layout/destinations';
import {MapLayout} from '@cdo/apps/adaptive/views/map/layout/types';

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

describe('layoutDestinations', () => {
  const leaf = (id: string, requires: string[], destination: string) => ({
    ...checkpoint(id, requires),
    destination,
  });
  // A start, three branches and a sub-branch, four destinations of three
  // leaves each, and a closing leaf with no destination.
  const pathway = [
    checkpoint('intro'),
    checkpoint('a', ['intro']),
    checkpoint('b', ['intro']),
    checkpoint('c', ['intro']),
    checkpoint('d', ['a']),
    leaf('n1', ['a'], 'North'),
    leaf('n2', ['b'], 'North'),
    leaf('n3', ['b'], 'North'),
    leaf('e1', ['b'], 'East'),
    leaf('e2', ['b'], 'East'),
    leaf('e3', ['b'], 'East'),
    leaf('s1', ['c'], 'South'),
    leaf('s2', ['c'], 'South'),
    leaf('s3', ['c'], 'South'),
    leaf('w1', ['d'], 'West'),
    leaf('w2', ['d'], 'West'),
    leaf('w3', ['d'], 'West'),
    checkpoint('show', ['a', 'b', 'c', 'd']),
  ];
  const layout = layoutDestinations(pathway);
  // Grid cells relative to the start.
  const cellsOf = (l: MapLayout) => {
    const {width, height} = l.cell!;
    const origin = l.nodes.intro;
    return Object.fromEntries(
      Object.values(l.nodes).map(n => [
        n.id,
        {col: (n.x - origin.x) / width, row: (n.y - origin.y) / height},
      ])
    );
  };
  const cells = cellsOf(layout);
  const ring = (id: string) =>
    Math.max(Math.abs(cells[id].col), Math.abs(cells[id].row));

  it('puts the start at the center and the destinations in the outer columns, left then right from the top', () => {
    expect(cells.intro).toEqual({col: 0, row: 0});
    expect([cells.n1, cells.n2, cells.n3]).toEqual([
      {col: -3, row: -3},
      {col: -3, row: -2},
      {col: -3, row: -1},
    ]);
    expect([cells.e1, cells.e2, cells.e3]).toEqual([
      {col: 3, row: -3},
      {col: 3, row: -2},
      {col: 3, row: -1},
    ]);
    expect([cells.s1, cells.s2, cells.s3]).toEqual([
      {col: -3, row: 1},
      {col: -3, row: 2},
      {col: -3, row: 3},
    ]);
    expect([cells.w1, cells.w2, cells.w3]).toEqual([
      {col: 3, row: 1},
      {col: 3, row: 2},
      {col: 3, row: 3},
    ]);
  });

  it('puts a checkpoint on the ring of its depth, toward its children', () => {
    // c feeds only the lower left; d feeds the lower right; a feeds d and
    // the upper left corner.
    expect(cells.c).toEqual({col: -1, row: 1});
    expect(cells.d).toEqual({col: 2, row: 1});
    expect(cells.a).toEqual({col: 1, row: -1});
  });

  it('gives a leaf with no destination a free cell on its ring, inside the outer columns', () => {
    expect(ring('show')).toBe(3);
    expect(Math.abs(cells.show.col)).toBeLessThan(3);
    const keys = Object.values(cells).map(c => `${c.col},${c.row}`);
    expect(new Set(keys).size).toBe(pathway.length);
  });

  it('keeps a free row between the stacks on a side', () => {
    const keys = new Set(Object.values(cells).map(c => `${c.col},${c.row}`));
    expect(keys.has('-3,0')).toBe(false);
    expect(keys.has('3,0')).toBe(false);
  });

  it('moves each destination one corner clockwise per turn, keeping the list order', () => {
    const turned = cellsOf(layoutDestinations(pathway, 1));
    expect(turned.n1).toEqual({col: 3, row: -3});
    expect(turned.e1).toEqual({col: 3, row: 1});
    expect(turned.w1).toEqual({col: -3, row: 1});
    expect(turned.s1).toEqual({col: -3, row: -3});
    expect(layoutDestinations(pathway, 1).destinations).toEqual(
      layout.destinations
    );
    expect(layoutDestinations(pathway, 4).nodes).toEqual(layout.nodes);
  });

  it('lists the destinations in authored order with their checkpoints', () => {
    expect(layout.destinations).toEqual([
      {title: 'North', ids: ['n1', 'n2', 'n3']},
      {title: 'East', ids: ['e1', 'e2', 'e3']},
      {title: 'South', ids: ['s1', 's2', 's3']},
      {title: 'West', ids: ['w1', 'w2', 'w3']},
    ]);
  });

  it('keeps every node inside the board, with room above and beside', () => {
    for (const n of Object.values(layout.nodes)) {
      expect(n.x).toBeGreaterThan(100);
      expect(n.x).toBeLessThan(layout.width - 100);
      expect(n.y).toBeGreaterThan(100);
      expect(n.y).toBeLessThan(layout.height - 60);
    }
  });

  it('lays a pathway with no destinations out from the center', () => {
    const plain = layoutDestinations(pathway.slice(0, 5));
    expect(plain.destinations).toEqual([]);
    const at = cellsOf(plain);
    expect(Math.abs(at.a.col)).toBeLessThanOrEqual(1);
    expect(Math.abs(at.a.row)).toBeLessThanOrEqual(1);
  });
});
