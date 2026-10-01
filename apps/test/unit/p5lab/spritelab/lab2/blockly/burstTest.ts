import burst, {
  BURST_LOOK_OPTIONS,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/burst';
import {BURST_LOOKS} from '@cdo/apps/p5lab/spritelab/lab2/bursts';

describe('spritelab2_burst', () => {
  it('offers every look as its own value', () => {
    expect(BURST_LOOK_OPTIONS.map(([label]) => label)).toEqual([
      ...BURST_LOOKS,
    ]);
    BURST_LOOK_OPTIONS.forEach(([label, value]) => expect(value).toBe(label));
  });

  it('generates a burstParticles call with the count, look and origin sprite', () => {
    const fields: Record<string, string> = {
      COUNT: '20',
      LOOK: 'confetti',
      ORIGIN: '"hero"',
    };
    const block = {getFieldValue: (name: string) => fields[name]};
    expect(burst.generator(block as never, {} as never)).toBe(
      'burstParticles(20, "confetti", {costume: "hero"});\n'
    );
  });
});
