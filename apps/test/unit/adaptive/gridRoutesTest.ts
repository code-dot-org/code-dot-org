import {Checkpoint} from '@cdo/apps/adaptive/types';
import {gridRoutes} from '@cdo/apps/adaptive/views/gridRoutes';
import {layoutCluster} from '@cdo/apps/adaptive/views/layout';

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
