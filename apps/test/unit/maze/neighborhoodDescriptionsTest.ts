import {
  describeAsset,
  describeNeighborhoodCell,
  SpriteMap,
} from '@cdo/apps/maze/neighborhoodDescriptions';
import realSprites from '@cdo/apps/maze/neighborhoodSprites.json';

// Names copied from apps/src/maze/neighborhoodSprites.json.
const SPRITES: SpriteMap = {
  '0': {name: 'street'},
  '12': {name: 'N-DonutTruck-1'},
  '46': {name: 'cone'},
  '62': {name: 'brick-wall-cracked1'},
  '159': {name: 'RedHouse-1'},
  '279': {name: 'bottom-left-sidewalk-corner-grass'},
  '287': {name: 'Painter-1'},
  '303': {name: 'paintcan'},
};

describe('describeAsset', () => {
  // The sweep below proves every sprite resolves to something. These pin the
  // wording for the shapes of name that are easy to get wrong: a direction
  // prefix and tile number to strip, a CamelCase family, and a whole family
  // of "brick-*" art that all reads as one word.
  it.each([
    [0, 'Street.'],
    [12, 'Donut truck.'],
    [46, 'Traffic cone.'],
    [62, 'Wall.'],
    [159, 'Red house.'],
  ])('names asset %i as %s', (assetId, expected) => {
    expect(describeAsset(SPRITES, assetId)).toBe(expected);
  });

  it('calls a grass-edged sidewalk a sidewalk', () => {
    expect(describeAsset(SPRITES, 279)).toBe('Sidewalk.');
  });

  it('returns null for the painter avatar', () => {
    expect(describeAsset(SPRITES, 287)).toBeNull();
  });

  // Buckets are drawn from a cell's paint count, not its art id, so the
  // paint can sprite has nothing to say on its own.
  it('returns null for the paint can sprite', () => {
    expect(describeAsset(SPRITES, 303)).toBeNull();
  });

  it('returns null for an unknown asset id', () => {
    expect(describeAsset(SPRITES, 9999)).toBeNull();
  });

  it('returns null with no asset id or no sprite map', () => {
    expect(describeAsset(SPRITES, undefined)).toBeNull();
    expect(describeAsset(undefined, 0)).toBeNull();
  });

  // Swept over the shipped sprite sheet, not a fixture: a family with no
  // matching token returns null, and the cell then reads as bare ground with
  // nothing to show that its scenery went unnamed. The painter avatar and the
  // paint can are described elsewhere and are meant to be null.
  it('names every sprite in the shipped sprite sheet', () => {
    const describedElsewhere = /painter|paintcan/i;
    const sprites = realSprites as unknown as SpriteMap;
    const unnamed = Object.entries(sprites)
      .filter(([, sprite]) => sprite && !describedElsewhere.test(sprite.name))
      .filter(([id]) => describeAsset(sprites, Number(id)) === null)
      .map(([id, sprite]) => `${id} (${sprite?.name})`);
    expect(unnamed).toEqual([]);
  });
});

describe('describeNeighborhoodCell', () => {
  // assetId 159 is a house, so this also pins that paint hides the scenery.
  it('leads with paint the student applied', () => {
    expect(
      describeNeighborhoodCell(SPRITES, {color: 'blue', assetId: 159})
    ).toBe('Painted blue.');
  });

  it('reports a bucket and its remaining paint', () => {
    expect(describeNeighborhoodCell(SPRITES, {paintCount: 5, assetId: 0})).toBe(
      'Paint bucket, 5 paint.'
    );
  });

  it('reports paint then bucket when a cell has both', () => {
    expect(
      describeNeighborhoodCell(SPRITES, {
        color: 'blue',
        paintCount: 1,
        assetId: 0,
      })
    ).toBe('Painted blue. Paint bucket, 1 paint.');
  });

  // Also shows scenery being named on a cell with no paint on it.
  it('ignores an empty bucket', () => {
    expect(describeNeighborhoodCell(SPRITES, {paintCount: 0, assetId: 0})).toBe(
      'Street.'
    );
  });

  it('returns null when a cell has nothing to report', () => {
    expect(describeNeighborhoodCell(SPRITES, {})).toBeNull();
  });
});
