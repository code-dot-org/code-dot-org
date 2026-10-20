import {Checkpoint} from '@cdo/apps/adaptive/types';
import {layoutCheckpoints} from '@cdo/apps/adaptive/views/layout';

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
