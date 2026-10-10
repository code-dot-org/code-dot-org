import {
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
