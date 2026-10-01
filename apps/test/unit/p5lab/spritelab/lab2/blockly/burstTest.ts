import burst from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/burst';

describe('spritelab2_burst', () => {
  it('generates a burstParticles call with the count, image and origin sprite', () => {
    const fields: Record<string, string> = {
      COUNT: '20',
      IMAGE: '"coin"',
      ORIGIN: '"hero"',
    };
    const block = {getFieldValue: (name: string) => fields[name]};
    expect(burst.generator(block as never, {} as never)).toBe(
      'burstParticles(20, "coin", {costume: "hero"});\n'
    );
  });
});
