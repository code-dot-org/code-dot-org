import setWorld, {
  placeWorld,
  SET_WORLD_MARKER,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setWorld';
import {worldFromFieldValue} from '@cdo/apps/p5lab/spritelab/lab2/blockly/worldField';
import {
  compileWorldPrelude,
  createEmptyWorld,
  paintWorldCell,
} from '@cdo/apps/p5lab/spritelab/lab2/world';

const SCENE_WORLD = 'setDefaultSpriteSize(40);\n';

type Block = Parameters<typeof setWorld.generator>[0];
type Generator = Parameters<typeof setWorld.generator>[1];

const blockWithWorld = (value: string) =>
  ({getFieldValue: () => value} as unknown as Block);

describe('set world block', () => {
  it('places the world drawn on it', () => {
    const world = paintWorldCell(createEmptyWorld(), 9, 0, {
      image: 'brick',
      kind: 'block',
    });
    const code = setWorld.generator(
      blockWithWorld(JSON.stringify(world)),
      {} as Generator
    );
    expect(code).toBe(`${SET_WORLD_MARKER}\n${compileWorldPrelude(world)}`);
    expect(code).toContain('makeNewGroupSprite("brick", \'walls\'');
  });

  it('places nothing when nothing is drawn on it', () => {
    expect(setWorld.generator(blockWithWorld(''), {} as Generator)).toBe(
      `${SET_WORLD_MARKER}\n`
    );
  });

  it('leaves out the scene world when the code has set world blocks', () => {
    const code = `a();\n${SET_WORLD_MARKER}\nb();\n`;
    expect(placeWorld(SCENE_WORLD, code)).toBe(code);
  });

  it('places the scene world ahead of code with no set world block', () => {
    expect(placeWorld(SCENE_WORLD, 'a();\n')).toBe(`${SCENE_WORLD}a();\n`);
  });
});

describe('worldFromFieldValue', () => {
  it('reads a saved world', () => {
    const world = createEmptyWorld(3);
    expect(worldFromFieldValue(JSON.stringify(world))).toEqual(world);
  });

  it('has no world for an empty or unreadable value', () => {
    expect(worldFromFieldValue('')).toBeUndefined();
    expect(worldFromFieldValue('{')).toBeUndefined();
    expect(worldFromFieldValue('{"grid": 3}')).toBeUndefined();
  });
});
