import {flatFromLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/applyLevelConfig';
import {levelConfigFromFlat} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/fromFlat';
import {LevelMode, tabsForMode} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

const converted = (levelMode?: LevelMode, more = {}) =>
  levelConfigFromFlat({levelMode, ...more});

const tabsAfter = (levelMode?: LevelMode) =>
  tabsForMode(flatFromLevelConfig(converted(levelMode).config).levelMode);

describe('levelConfigFromFlat', () => {
  it('writes free play as every tab, scenes the student changes and collapsed instructions', () => {
    expect(converted({kind: 'freeplay'}).config).toEqual({
      images: {},
      world: {},
      scenes: {canChange: true},
      instructions: {startCollapsed: true},
    });
  });

  it('writes an image level as a level that edits images alone', () => {
    const {config} = converted({
      kind: 'image',
      imageType: 'sprite',
      imageRole: 'hero',
      oneImage: true,
    });
    expect(config).toEqual({
      focus: 'images',
      edits: ['images'],
      images: {makes: {type: 'sprite', role: 'hero'}, onlyThisImage: true},
    });
    expect(tabsAfter({kind: 'image'})).toEqual(['Images']);
  });

  it('keeps the Images settings of a code level without its tab', () => {
    const {config} = converted({kind: 'code', noNewImages: true});
    expect(config).toEqual({edits: ['code'], images: {canAdd: false}});
    expect(tabsAfter({kind: 'code', noNewImages: true})).toEqual([
      'Code',
      'Play',
    ]);
  });

  it('keeps a world level that makes its image first opening on Images', () => {
    const mode: LevelMode = {
      kind: 'world',
      imageFirst: true,
      imageType: 'sprite',
    };
    expect(tabsAfter(mode)).toEqual(tabsForMode(mode));
  });

  it('opens where the start tab says', () => {
    const mode: LevelMode = {kind: 'freeplay', startTab: 'Images'};
    expect(converted(mode).config.focus).toBe('images');
    expect(tabsAfter(mode)?.[0]).toBe('Images');
  });

  it('writes a play level as one the student changes nothing on', () => {
    expect(converted({kind: 'play'}).config).toEqual({
      focus: 'play',
      edits: [],
    });
    expect(tabsAfter({kind: 'play'})).toEqual(['Play']);
  });

  it('carries a level with no project', () => {
    const {config} = levelConfigFromFlat({
      levelMode: {kind: 'play'},
      noProject: true,
    });
    expect(config.noProject).toBe(true);
    expect(flatFromLevelConfig(config).noProject).toBe(true);
  });

  it('lists what it cannot carry', () => {
    const {dropped} = converted(
      {kind: 'code', sentence: 'x'} as unknown as LevelMode,
      {worldStartPattern: ['B']}
    );
    expect(dropped).toEqual([
      'level_mode.sentence: "x"',
      'world_start_pattern: the level pins no scene to put it in',
    ]);
  });
});
