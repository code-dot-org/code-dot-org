import {
  adlibSetForMode,
  isFreeplayMode,
  isImageMode,
  tabsForMode,
} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

describe('tabsForMode', () => {
  it('opens on the first tab it names', () => {
    expect(tabsForMode({kind: 'code'})).toEqual(['Code', 'Play']);
    expect(tabsForMode({kind: 'world'})).toEqual(['World', 'Play']);
    expect(tabsForMode({kind: 'play'})).toEqual(['Play']);
  });

  it('gives an image level no tabs: its panel replaces them', () => {
    expect(tabsForMode({kind: 'image'})).toEqual([]);
  });

  it('leaves a level with no mode on the lab default', () => {
    expect(tabsForMode(undefined)).toBeUndefined();
  });
});

describe('isImageMode / isFreeplayMode', () => {
  it('names one kind each', () => {
    expect(isImageMode({kind: 'image'})).toBe(true);
    expect(isImageMode({kind: 'freeplay'})).toBe(false);
    expect(isFreeplayMode({kind: 'freeplay'})).toBe(true);
    expect(isFreeplayMode(undefined)).toBe(false);
  });
});

describe('adlibSetForMode', () => {
  it('falls back to the set the kind implies', () => {
    expect(adlibSetForMode({kind: 'image'})).toBe('simple');
    expect(adlibSetForMode({kind: 'freeplay'})).toBe('expanded');
  });

  it('lets a level name its own set instead', () => {
    expect(adlibSetForMode({kind: 'image', adlibs: 'treasure'})).toBe(
      'treasure'
    );
  });

  it('offers no combos to a kind that generates no images', () => {
    expect(adlibSetForMode({kind: 'code'})).toBeUndefined();
    expect(adlibSetForMode(undefined)).toBeUndefined();
  });
});
