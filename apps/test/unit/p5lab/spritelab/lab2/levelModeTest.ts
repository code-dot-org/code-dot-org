import {LevelMode, tabsForMode} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

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

  it('opens on the start tab when the level shows it', () => {
    expect(tabsForMode({kind: 'freeplay', startTab: 'Images'})).toEqual([
      'Images',
      'Code',
      'World',
      'Play',
    ]);
    expect(
      tabsForMode({kind: 'code', extraTabs: ['World'], startTab: 'World'})
    ).toEqual(['World', 'Code', 'Play']);
    expect(tabsForMode({kind: 'code', startTab: 'Images'})).toEqual([
      'Code',
      'Play',
    ]);
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
