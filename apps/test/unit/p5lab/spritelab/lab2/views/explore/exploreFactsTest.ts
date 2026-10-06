import {pickFact} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreFacts';

const every = (context: {animated: boolean; pixel: boolean}) => {
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) {
    seen.add(pickFact(context, undefined, () => i / 200));
  }
  return [...seen];
};

describe('exploreFacts', () => {
  it('keeps the pixel and animation facts for pictures that are those', () => {
    const smoothStill = every({animated: false, pixel: false});
    expect(smoothStill.some(f => /Pixel art/.test(f))).toBe(false);
    expect(smoothStill.some(f => /animated/.test(f))).toBe(false);
    const pixelSet = every({animated: true, pixel: true});
    expect(pixelSet.some(f => /Pixel art/.test(f))).toBe(true);
    expect(pixelSet.some(f => /animated/.test(f))).toBe(true);
  });

  it('does not repeat the fact just shown', () => {
    const context = {animated: true, pixel: true};
    const first = pickFact(context, undefined, () => 0);
    expect(pickFact(context, first, () => 0)).not.toBe(first);
  });
});
