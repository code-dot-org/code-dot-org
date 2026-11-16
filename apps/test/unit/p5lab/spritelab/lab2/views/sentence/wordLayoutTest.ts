import {readWordLayout} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/wordLayout';

describe('readWordLayout', () => {
  it('is clusters unless the parameter names a carousel', () => {
    expect(readWordLayout(() => undefined)).toBe('clusters');
    expect(readWordLayout(() => 'sideways')).toBe('clusters');
    expect(readWordLayout(() => 'carousel')).toBe('carousel');
    expect(readWordLayout(() => 'vcarousel')).toBe('vcarousel');
  });
});
