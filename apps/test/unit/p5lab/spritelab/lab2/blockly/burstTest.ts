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

  const block = (fields: Record<string, string>) => ({
    getFieldValue: (name: string) => fields[name],
  });

  it('bursts from the sprite plugged into its socket', () => {
    const javascript = {valueToCode: () => "{group: 'players'}"};
    expect(
      burst.generator(
        block({COUNT: '20', LOOK: 'confetti'}) as never,
        javascript as never
      )
    ).toBe('burstParticles(20, "confetti", {group: \'players\'});\n');
  });

  it('bursts from no sprite when its socket is empty', () => {
    const javascript = {valueToCode: () => ''};
    expect(
      burst.generator(
        block({COUNT: '5', LOOK: 'dust'}) as never,
        javascript as never
      )
    ).toBe('burstParticles(5, "dust", null);\n');
  });
});
