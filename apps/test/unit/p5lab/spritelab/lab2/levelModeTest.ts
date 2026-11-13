import {
  generationLimitForMode,
  imageSourceFor,
  imageSourceForMode,
  isFreeplayMode,
  isOneImageMode,
  LevelMode,
  tabsForMode,
} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

describe('tabsForMode', () => {
  it('ignores extra tabs that were saved as something other than a list', () => {
    const saved = {kind: 'code', extraTabs: true} as unknown as LevelMode;
    expect(tabsForMode(saved)).toEqual(['Code', 'Play']);
  });

  it('opens on the first tab it names', () => {
    expect(tabsForMode({kind: 'code'})).toEqual(['Code', 'Play']);
    expect(tabsForMode({kind: 'world'})).toEqual(['World', 'Play']);
    expect(tabsForMode({kind: 'play'})).toEqual(['Play']);
  });

  it('adds the extra tabs a level names, after its own, and ignores other names', () => {
    expect(tabsForMode({kind: 'code', extraTabs: ['Images']})).toEqual([
      'Code',
      'Play',
      'Images',
    ]);
    expect(
      tabsForMode({kind: 'code', extraTabs: ['World', 'Images', 'Sound']})
    ).toEqual(['Code', 'Play', 'Images', 'World']);
    // A tab the level already has is not added twice.
    expect(tabsForMode({kind: 'world', extraTabs: ['World']})).toEqual([
      'World',
      'Play',
    ]);
    // The level still opens on its own first tab.
    expect(
      tabsForMode({kind: 'code', imageFirst: true, extraTabs: ['World']})
    ).toEqual(['Images', 'Code', 'Play', 'World']);
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

describe('isOneImageMode', () => {
  it('is an opt-in, whatever the kind', () => {
    expect(isOneImageMode({kind: 'image', imageType: 'sprite'})).toBe(false);
    expect(
      isOneImageMode({kind: 'image', imageType: 'sprite', oneImage: true})
    ).toBe(true);
    expect(isOneImageMode({kind: 'code', oneImage: true})).toBe(true);
    expect(isOneImageMode(undefined)).toBe(false);
  });
});

describe('generationLimitForMode', () => {
  it('is no limit unless the level asks for one', () => {
    expect(generationLimitForMode(undefined)).toBeUndefined();
    expect(generationLimitForMode({kind: 'freeplay'})).toBeUndefined();
    expect(
      generationLimitForMode({kind: 'code', extraTabs: ['Images']})
    ).toBeUndefined();
    expect(
      generationLimitForMode({kind: 'image', oneImage: true})
    ).toBeUndefined();
  });

  it('is the limit the level names', () => {
    expect(generationLimitForMode({kind: 'code', generationLimit: 3})).toBe(3);
    expect(
      generationLimitForMode({
        kind: 'image',
        oneImage: true,
        generationLimit: 8,
      })
    ).toBe(8);
  });

  it('ignores a limit that was saved as something other than a count', () => {
    const saved = (generationLimit: unknown) =>
      ({kind: 'code', generationLimit} as unknown as LevelMode);
    expect(generationLimitForMode(saved('5'))).toBeUndefined();
    expect(generationLimitForMode(saved(0))).toBeUndefined();
    expect(generationLimitForMode(saved(2.5))).toBeUndefined();
  });
});

describe('imageSourceFor', () => {
  const liveLevel: LevelMode = {kind: 'image', imageSource: 'live'};

  it('gives anyone but a levelbuilder the tree, whatever is asked for', () => {
    expect(imageSourceFor(liveLevel, undefined, false)).toBe('cached');
    expect(imageSourceFor({kind: 'image'}, 'live', false)).toBe('cached');
  });

  it("gives a levelbuilder the level's source, or the one asked for", () => {
    expect(imageSourceFor(liveLevel, undefined, true)).toBe('live');
    expect(imageSourceFor({kind: 'image'}, 'live', true)).toBe('live');
    expect(imageSourceFor(liveLevel, 'cached', true)).toBe('cached');
    expect(imageSourceFor({kind: 'image'}, undefined, true)).toBe('cached');
  });
});

describe('imageSourceForMode', () => {
  it('is the tree first unless the level names a source', () => {
    expect(imageSourceForMode({kind: 'image'})).toBe('cached');
    expect(imageSourceForMode(undefined)).toBe('cached');
    expect(imageSourceForMode({kind: 'image', imageSource: 'live'})).toBe(
      'live'
    );
  });
});
