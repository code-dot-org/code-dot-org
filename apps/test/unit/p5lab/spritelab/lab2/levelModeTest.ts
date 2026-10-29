import {
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
