import {
  levelConfigFromFlat,
  withLevelConfig,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/applyLevelConfig';
import {SpriteLab2LevelProperties} from '@cdo/apps/p5lab/spritelab/lab2/types';

const level = (
  properties: Partial<SpriteLab2LevelProperties>
): SpriteLab2LevelProperties => properties as SpriteLab2LevelProperties;

describe('withLevelConfig', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it('returns a level with no config as it is', () => {
    const properties = level({levelMode: {kind: 'code'}});
    expect(withLevelConfig(properties)).toBe(properties);
  });

  it('lays the Images group over the level mode', () => {
    const applied = withLevelConfig(
      level({
        levelMode: {kind: 'image'},
        levelConfig: {
          images: {
            makes: {type: 'sprite', subject: 'object', role: 'treasure'},
            onlyThisImage: true,
            explainAi: true,
            source: 'live',
          },
        },
      })
    );
    expect(applied.levelMode).toEqual({
      kind: 'image',
      imageType: 'sprite',
      imageSubject: 'object',
      imageRole: 'treasure',
      oneImage: true,
      learning: true,
      imageSource: 'live',
    });
  });

  it('lays the World group over the level mode and the start pattern', () => {
    const applied = withLevelConfig(
      level({
        levelMode: {kind: 'world'},
        levelConfig: {
          world: {
            paletteRoles: ['treasure'],
            startPattern: ['.S.', 'BBB'],
            startRoles: {F: 'friend'},
          },
        },
      })
    );
    expect(applied.levelMode).toEqual({
      kind: 'world',
      paletteRoles: ['treasure'],
    });
    expect(applied.worldStartPattern).toEqual(['.S.', 'BBB']);
    expect(applied.worldStartRoles).toEqual({F: 'friend'});
  });

  it('lets the config win, and keeps an older setting the config leaves out', () => {
    const applied = withLevelConfig(
      level({
        levelMode: {kind: 'world', imageRole: 'hero', paletteRoles: ['block']},
        worldStartPattern: ['BBB'],
        levelConfig: {world: {paletteRoles: ['treasure']}},
      })
    );
    expect(applied.levelMode).toEqual({
      kind: 'world',
      imageRole: 'hero',
      paletteRoles: ['treasure'],
    });
    expect(applied.worldStartPattern).toEqual(['BBB']);
  });

  it('ignores a config with a problem, and says so', () => {
    const properties = level({
      levelMode: {kind: 'world'},
      levelConfig: {world: {paletteRole: ['treasure']}},
    });
    expect(withLevelConfig(properties)).toBe(properties);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('levelConfigFromFlat', () => {
  it('writes the older properties in the grouped shape', () => {
    expect(
      levelConfigFromFlat({
        levelMode: {
          kind: 'world',
          imageType: 'sprite',
          imageRole: 'friend',
          oneImage: true,
          paletteRoles: ['friend', 'block'],
        },
        worldStartPattern: ['.S.', 'BBB'],
      })
    ).toEqual({
      images: {makes: {type: 'sprite', role: 'friend'}, onlyThisImage: true},
      world: {paletteRoles: ['friend', 'block'], startPattern: ['.S.', 'BBB']},
    });
  });

  it('leaves out a group with nothing set', () => {
    expect(levelConfigFromFlat({levelMode: {kind: 'code'}})).toEqual({});
  });

  it('gives back the same settings when laid over a bare mode', () => {
    const levelMode = {
      kind: 'world' as const,
      imageType: 'sprite' as const,
      imageRole: 'friend',
      paletteRoles: ['friend'],
    };
    const applied = withLevelConfig(
      level({
        levelMode: {kind: 'world'},
        levelConfig: levelConfigFromFlat({levelMode}),
      })
    );
    expect(applied.levelMode).toEqual(levelMode);
  });
});
