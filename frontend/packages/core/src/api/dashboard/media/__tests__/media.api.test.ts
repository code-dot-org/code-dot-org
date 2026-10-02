import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createMediaApi, needsMediaProxy} from '../media.api';

function mockTransport() {
  const blob = new Blob(['png']);
  return {
    blob,
    transport: {
      request: vi.fn(),
      requestBlob: vi.fn().mockResolvedValue(blob),
      requestWithMeta: vi.fn(),
    } satisfies Transport,
  };
}

describe('needsMediaProxy', () => {
  it('proxies absolute URLs on hosts without cross-origin reads', () => {
    expect(needsMediaProxy('https://example.com/a.png')).toBe(true);
    expect(needsMediaProxy('http://example.com/a.png')).toBe(true);
    expect(needsMediaProxy('https://images.code.org/a.png')).toBe(false);
    expect(needsMediaProxy('https://curriculum.code.org/a.png')).toBe(false);
    expect(needsMediaProxy('/v3/animations/ch/a.png')).toBe(false);
  });
});

describe('createMediaApi', () => {
  it('GETs a site path as it is', async () => {
    const {transport, blob} = mockTransport();
    const result = await createMediaApi(transport).getImage({
      url: '/v3/animations/ch/a.png?version=3',
    });
    expect(transport.requestBlob).toHaveBeenCalledWith({
      method: 'GET',
      url: '/v3/animations/ch/a.png?version=3',
    });
    expect(result).toBe(blob);
  });

  it('GETs an open host directly', async () => {
    const {transport} = mockTransport();
    await createMediaApi(transport).getImage({
      url: 'https://images.code.org/a.png',
    });
    expect(transport.requestBlob).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://images.code.org/a.png',
    });
  });

  it('GETs another host through the proxy, its spaces encoded twice', async () => {
    const {transport} = mockTransport();
    await createMediaApi(transport).getImage({
      url: 'https://example.com/my cat.png',
    });
    expect(transport.requestBlob).toHaveBeenCalledWith({
      method: 'GET',
      url: '/media',
      query: {u: 'https://example.com/my%20cat.png'},
    });
  });
});
