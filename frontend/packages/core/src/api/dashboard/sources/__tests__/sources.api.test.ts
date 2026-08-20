import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createSourcesApi} from '../sources.api';

function mockTransport() {
  const request = vi
    .fn()
    .mockResolvedValue({timestamp: null, versionId: 'version-2'});
  const transport = {
    request,
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  } as unknown as Transport;
  return {api: createSourcesApi(transport), request};
}

describe('createSourcesApi.update', () => {
  it('serializes version-aware save options', async () => {
    const {api, request} = mockTransport();

    await api.update({
      channelId: 'channel-1',
      options: {
        currentVersion: 'version-1',
        firstSaveTimestamp: '2026-08-20T13:00:00Z',
        projectType: 'build-lab',
        replace: true,
        tabId: 'tab-1',
      },
      sources: {source: '{}'},
    });

    expect(request).toHaveBeenCalledWith({
      body: {source: '{}'},
      method: 'PUT',
      url: '/v3/sources/channel-1/main.json?currentVersion=version-1&firstSaveTimestamp=2026-08-20T13%3A00%3A00Z&projectType=build-lab&replace=true&tabId=tab-1',
    });
  });

  it('omits undefined options from the query string', async () => {
    const {api, request} = mockTransport();

    await api.update({
      channelId: 'channel-1',
      options: {currentVersion: undefined, projectType: 'build-lab'},
      sources: {source: '{}'},
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/v3/sources/channel-1/main.json?projectType=build-lab',
      }),
    );
  });
});
