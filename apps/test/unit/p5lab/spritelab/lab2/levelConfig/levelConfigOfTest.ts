import {levelConfigOf} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/levelConfigOf';
import {SpriteLab2LevelProperties} from '@cdo/apps/p5lab/spritelab/lab2/types';

const level = (properties: Partial<SpriteLab2LevelProperties>) =>
  properties as SpriteLab2LevelProperties;

describe('levelConfigOf', () => {
  it("reads the level's level_config", () => {
    expect(levelConfigOf(level({levelConfig: {world: {}}}))).toEqual({
      world: {},
    });
  });

  it('ignores older properties beside a level_config', () => {
    expect(
      levelConfigOf(
        level({levelConfig: {}, levelMode: {kind: 'world'}, noProject: true})
      )
    ).toEqual({});
  });

  it('converts the older properties of a level without one', () => {
    expect(
      levelConfigOf(level({levelMode: {kind: 'world'}, noProject: true}))
    ).toEqual({focus: 'world', edits: ['world'], world: {}, noProject: true});
  });

  it('reads the older properties when the level_config has problems', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      levelConfigOf(
        level({levelConfig: {focus: 'nowhere'}, levelMode: {kind: 'world'}})
      )
    ).toEqual({focus: 'world', edits: ['world'], world: {}});
    expect(console.warn).toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('gives the same config each time for the same level', () => {
    const properties = level({levelConfig: {images: {}}});
    expect(levelConfigOf(properties)).toBe(levelConfigOf(properties));
  });
});
