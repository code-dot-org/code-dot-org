import {describe, expect, it} from 'vitest';

import {
  previewEffectTime,
  previewTime,
  restartEffectTime,
} from '../previewClock';

describe('previewClock', () => {
  it('runs both clocks from a shared epoch', async () => {
    await new Promise(resolve => setTimeout(resolve, 15));
    expect(previewTime()).toBeGreaterThan(0);
    expect(previewEffectTime()).toBeGreaterThan(0);
  });

  it('restarts effect time without touching engine time', async () => {
    await new Promise(resolve => setTimeout(resolve, 15));
    const engineBefore = previewTime();
    const effectBefore = previewEffectTime();

    restartEffectTime();

    expect(previewEffectTime()).toBeLessThan(effectBefore);
    expect(previewEffectTime()).toBeGreaterThanOrEqual(0);
    expect(previewTime()).toBeGreaterThanOrEqual(engineBefore);
  });
});
