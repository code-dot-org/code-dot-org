import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {animationUrl, createAnimationsApi} from '../animations.api';

describe('animationUrl', () => {
  it('encodes the key but keeps its slashes', () => {
    expect(animationUrl('ch', 'a b/c#d')).toBe(
      '/v3/animations/ch/a%20b/c%23d.png',
    );
  });
});

describe('createAnimationsApi', () => {
  it('DELETEs an animation', async () => {
    const transport = {
      request: vi.fn().mockResolvedValue(undefined),
      requestBlob: vi.fn(),
      requestWithMeta: vi.fn(),
    } satisfies Transport;
    await createAnimationsApi(transport).remove({channelId: 'ch', key: 'k'});
    expect(transport.request).toHaveBeenCalledWith({
      method: 'DELETE',
      url: '/v3/animations/ch/k.png',
    });
  });
});
