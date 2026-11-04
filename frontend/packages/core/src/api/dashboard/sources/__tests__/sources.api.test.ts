import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createSourcesApi} from '../sources.api';

const SOURCES = {source: {files: {}, folders: {}}};

describe('loading sources', () => {
  it('reads the version from the header as the transport hands it over', async () => {
    // The transport lowercases header names; the mixed-case lookup missed,
    // and every load reported 'unknown'.
    const requestWithMeta = vi.fn().mockResolvedValue({
      data: SOURCES,
      meta: {status: 200, headers: {'s3-version-id': 'v7'}, url: '/x'},
    });
    const api = createSourcesApi({requestWithMeta} as unknown as Transport);

    const {versionId} = await api.get({channelId: 'c1'});

    expect(versionId).toBe('v7');
  });
});
