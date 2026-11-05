import {Pathway} from '@cdo/apps/adaptive/types';
import {resolveMapSettings} from '@cdo/apps/adaptive/views/map/mapSettings';

const pathway = (map?: Pathway['map']) => ({map} as Pathway);

describe('resolveMapSettings', () => {
  it('draws the tree facing north unless told otherwise', () => {
    expect(resolveMapSettings(pathway(), '')).toEqual({
      layout: 'tree',
      turns: 0,
      hideStats: false,
    });
  });

  it("takes the pathway's map, each orientation step a quarter turn", () => {
    expect(
      resolveMapSettings(
        pathway({layout: 'destinations', orientation: 's'}),
        ''
      )
    ).toEqual({layout: 'destinations', turns: 2, hideStats: false});
  });

  it('lets the URL override the pathway, ignoring values it does not know', () => {
    const authored = pathway({layout: 'destinations', orientation: 'e'});
    expect(
      resolveMapSettings(authored, '?mapLayout=tree&mapOrientation=w')
    ).toEqual({layout: 'tree', turns: 3, hideStats: false});
    expect(
      resolveMapSettings(authored, '?mapLayout=spiral&mapOrientation=up')
    ).toEqual({layout: 'destinations', turns: 1, hideStats: false});
  });

  it('hides the totals only for hide-adaptive-stats=true', () => {
    expect(
      resolveMapSettings(pathway(), '?hide-adaptive-stats=true').hideStats
    ).toBe(true);
    expect(
      resolveMapSettings(pathway(), '?hide-adaptive-stats=1').hideStats
    ).toBe(false);
  });
});
