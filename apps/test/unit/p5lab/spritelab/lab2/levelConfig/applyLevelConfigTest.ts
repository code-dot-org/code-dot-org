import {withLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/applyLevelConfig';
import {SpriteLab2LevelProperties} from '@cdo/apps/p5lab/spritelab/lab2/types';

describe('withLevelConfig', () => {
  const level = (properties: Partial<SpriteLab2LevelProperties>) =>
    ({id: 1, ...properties} as SpriteLab2LevelProperties);

  it('leaves a level with no config as it is', () => {
    const properties = level({levelMode: {kind: 'code'}});
    expect(withLevelConfig(properties)).toBe(properties);
  });

  it('gives the lab the properties it reads', () => {
    const applied = withLevelConfig(
      level({
        levelConfig: {
          focus: 'code',
          edits: ['images', 'code'],
          images: {canAdd: false, explainAi: true},
          blocks: {lockEarlier: true, catalog: true},
          guide: {title: 'A title', freePlayIntro: true},
        },
      })
    );
    expect(applied.levelMode).toEqual({
      kind: 'code',
      extraTabs: ['Images'],
      noNewImages: true,
      learning: true,
    });
    expect(applied.lockEarlierBlocks).toBe(true);
    expect(applied.blockCatalog).toBe(true);
    expect(applied.objectives).toEqual({title: 'A title'});
    expect(applied.freeplayIntro).toBe(true);
  });

  it('lets a level say the student can change scenes', () => {
    const applied = withLevelConfig(
      level({
        levelConfig: {
          focus: 'code',
          edits: ['code'],
          scenes: {canChange: true},
        },
      })
    );
    expect(applied.studentChangesScenes).toBe(true);
    expect(applied.pinnedScene).toBeUndefined();
  });

  it('treats a config that says nothing about its focus as free play', () => {
    expect(withLevelConfig(level({levelConfig: {}})).levelMode).toEqual({
      kind: 'freeplay',
    });
  });

  it('takes the config as the whole of the settings', () => {
    const applied = withLevelConfig(
      level({
        levelConfig: {focus: 'play', edits: []},
        levelMode: {kind: 'world', oneImage: true},
        worldKeepsRoles: ['hero'],
        lockEarlierBlocks: true,
      })
    );
    expect(applied.levelMode).toEqual({kind: 'play'});
    expect(applied.worldKeepsRoles).toBeUndefined();
    expect(applied.lockEarlierBlocks).toBeUndefined();
    expect(applied.id).toBe(1);
  });

  it('ignores a config with a problem, and says so', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const properties = level({
      levelConfig: {focus: 'code'},
      levelMode: {kind: 'world'},
    });
    expect(withLevelConfig(properties)).toBe(properties);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
