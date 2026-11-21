import {
  flatFromLevelConfig,
  withLevelConfig,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/applyLevelConfig';
import {tabsForMode} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';
import {SpriteLab2LevelProperties} from '@cdo/apps/p5lab/spritelab/lab2/types';

const level = (more: Partial<SpriteLab2LevelProperties>) =>
  ({id: 1, ...more} as SpriteLab2LevelProperties);

describe('flatFromLevelConfig', () => {
  it('gives an empty config the Code tab and the game, and one scene', () => {
    const flat = flatFromLevelConfig({});
    expect(tabsForMode(flat.levelMode)).toEqual(['Code', 'Play']);
    expect(flat.studentChangesScenes).toBe(false);
    expect(flat.instructionsStartCollapsed).toBe(false);
  });

  it('adds the Images tab only for a level with images', () => {
    expect(tabsForMode(flatFromLevelConfig({images: {}}).levelMode)).toEqual([
      'Code',
      'Play',
      'Images',
    ]);
  });

  it('opens on the game when the level says so', () => {
    expect(
      tabsForMode(flatFromLevelConfig({focus: 'play'}).levelMode)?.[0]
    ).toBe('Play');
  });
});

describe('withLevelConfig', () => {
  it('leaves a level with no config as it is', () => {
    const properties = level({levelMode: {kind: 'world'}});
    expect(withLevelConfig(properties)).toBe(properties);
  });

  it('ignores the earlier properties of a level with a config', () => {
    const applied = withLevelConfig(
      level({
        levelConfig: {},
        levelMode: {kind: 'world'},
        worldKeepsRoles: ['x'],
      })
    );
    expect(applied.levelMode).toEqual({kind: 'code'});
    expect(applied.worldKeepsRoles).toBeUndefined();
  });

  it('ignores a config that is not valid, and says why', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const properties = level({levelConfig: {wrold: {}}});
    expect(withLevelConfig(properties)).toBe(properties);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
