// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vitest';

import {createHttpTransport} from '../httpTransport';

afterEach(() => vi.unstubAllGlobals());

describe('createHttpTransport redirect:manual', () => {
  it('treats an opaqueredirect (server 302) as a successful empty response', async () => {
    // A manual-redirect request the server 302'd resolves to an opaqueredirect;
    // the transport must not throw, and must not try to follow it.
    const fetchMock = vi.fn().mockResolvedValue({
      type: 'opaqueredirect',
      ok: false,
      status: 0,
      url: '/expire_other',
      headers: new Headers(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const transport = createHttpTransport({baseUrl: ''});
    const {data, meta} = await transport.requestWithMeta({
      method: 'DELETE',
      url: '/expire_other',
      redirect: 'manual',
    });

    expect(data).toBeUndefined();
    expect(meta.status).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({redirect: 'manual'}),
    );
  });

  it('still throws an ApiError on a real failure (non-redirect)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('boom', {
          status: 500,
          headers: {'content-type': 'text/plain'},
        }),
      ),
    );
    const transport = createHttpTransport({baseUrl: ''});
    await expect(
      transport.requestWithMeta({method: 'GET', url: '/x'}),
    ).rejects.toMatchObject({status: 500});
  });
});
