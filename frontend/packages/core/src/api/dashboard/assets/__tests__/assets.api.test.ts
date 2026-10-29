// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {assetUrl, createAssetsApi} from '../assets.api';

function fakeTransport() {
  const request = vi.fn().mockResolvedValue(undefined);
  const transport = {request} as unknown as Transport;
  return {api: createAssetsApi(transport), request};
}

describe('createAssetsApi', () => {
  it('PUTs the file as FormData and returns its URL', async () => {
    const {api, request} = fakeTransport();
    const data = new Blob([new Uint8Array([1, 2, 3])], {type: 'image/png'});
    const {url} = await api.upload({
      channelId: 'chan',
      filename: 'x.png',
      data,
    });

    expect(url).toBe('/v3/assets/chan/x.png');
    const call = request.mock.calls[0][0];
    expect(call.method).toBe('PUT');
    expect(call.url).toBe('/v3/assets/chan/x.png');
    expect(call.body).toBeInstanceOf(FormData);
    expect((call.body as FormData).get('file')).toBeInstanceOf(Blob);
  });

  it('DELETEs an asset by path', async () => {
    const {api, request} = fakeTransport();
    await api.remove({channelId: 'chan', filename: 'x.png'});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({method: 'DELETE', url: '/v3/assets/chan/x.png'}),
    );
  });

  it('builds a stable asset URL', () => {
    expect(assetUrl('c', 'f.png')).toBe('/v3/assets/c/f.png');
  });
});
