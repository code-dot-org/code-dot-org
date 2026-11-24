import setWorld, {
  placeWorld,
  SET_WORLD_MARKER,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setWorld';

const WORLD = 'setDefaultSpriteSize(40);\n';

describe('set world block', () => {
  it('generates a stand-in for the world', () => {
    expect(
      setWorld.generator(
        {} as Parameters<typeof setWorld.generator>[0],
        {} as Parameters<typeof setWorld.generator>[1]
      )
    ).toBe(`${SET_WORLD_MARKER}\n`);
  });

  it('places the world where the block runs', () => {
    expect(placeWorld(WORLD, `a();\n${SET_WORLD_MARKER}\nb();\n`)).toBe(
      `a();\n${WORLD}\nb();\n`
    );
  });

  it('places the world ahead of code with no set world block', () => {
    expect(placeWorld(WORLD, 'a();\n')).toBe(`${WORLD}a();\n`);
  });
});
