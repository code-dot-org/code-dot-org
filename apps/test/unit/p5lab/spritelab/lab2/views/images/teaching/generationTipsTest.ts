import {
  GENERATION_TIPS,
  pickTip,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/generationTips';

describe('generationTips', () => {
  it('picks a tip from the list', () => {
    expect(GENERATION_TIPS).toContain(pickTip());
  });

  it('never repeats the tip just shown', () => {
    const first = GENERATION_TIPS[0];
    expect(pickTip(first, () => 0)).toBe(GENERATION_TIPS[1]);
    expect(pickTip(undefined, () => 0)).toBe(first);
  });
});
