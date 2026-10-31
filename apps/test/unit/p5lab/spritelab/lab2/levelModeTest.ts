import {
  imageSourceForMode,
  isFreeplayMode,
  tabsForMode,
} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

describe('tabsForMode', () => {
  it('opens on the first tab it names', () => {
    expect(tabsForMode({kind: 'code'})).toEqual(['Code', 'Play']);
    expect(tabsForMode({kind: 'world'})).toEqual(['World', 'Play']);
    expect(tabsForMode({kind: 'play'})).toEqual(['Play']);
  });

  it('gives an image level the Images tab alone', () => {
    expect(tabsForMode({kind: 'image'})).toEqual(['Images']);
  });

  it('puts Images first when the level asks for it', () => {
    expect(tabsForMode({kind: 'code', imageFirst: true})).toEqual([
      'Images',
      'Code',
      'Play',
    ]);
    expect(tabsForMode({kind: 'world', imageFirst: true})).toEqual([
      'Images',
      'World',
      'Play',
    ]);
    expect(tabsForMode({kind: 'freeplay', imageFirst: true})).toEqual([
      'Code',
      'Images',
      'World',
      'Play',
    ]);
    expect(tabsForMode({kind: 'world', imageType: 'sprite'})).toEqual([
      'World',
      'Play',
    ]);
  });

  it('leaves a kind it does not know on the lab default', () => {
    expect(tabsForMode({kind: 'build'} as never)).toBeUndefined();
  });

  it('leaves a level with no mode on the lab default', () => {
    expect(tabsForMode(undefined)).toBeUndefined();
  });
});

describe('isFreeplayMode', () => {
  it('names one kind', () => {
    expect(isFreeplayMode({kind: 'freeplay'})).toBe(true);
    expect(isFreeplayMode(undefined)).toBe(false);
  });
});

describe('imageSourceForMode', () => {
  it('is live unless the level names a source', () => {
    expect(imageSourceForMode({kind: 'image'})).toBe('live');
    expect(imageSourceForMode(undefined)).toBe('live');
    expect(imageSourceForMode({kind: 'image', imageSource: 'cached'})).toBe(
      'cached'
    );
  });
});
