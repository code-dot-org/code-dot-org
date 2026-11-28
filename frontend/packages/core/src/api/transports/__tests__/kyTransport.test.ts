import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createKyTransport} from '../kyTransport';

interface SentRequest {
  contentType: string | null;
  body: string;
}

describe('createKyTransport', () => {
  let sent: SentRequest;

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        sent = {
          contentType: request.headers.get('Content-Type'),
          body: await request.text(),
        };
        return new Response('{}', {
          headers: {'Content-Type': 'application/json'},
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should send a Blob body unchanged with its own content type', async () => {
    const transport = createKyTransport({baseUrl: 'https://example.test'});

    await transport.request({
      method: 'PUT',
      url: '/upload',
      body: new Blob(['video-bytes'], {type: 'video/webm'}),
    });

    expect(sent).toEqual({contentType: 'video/webm', body: 'video-bytes'});
  });

  it('should send a plain object body as JSON', async () => {
    const transport = createKyTransport({baseUrl: 'https://example.test'});

    await transport.request({method: 'POST', url: '/items', body: {id: 7}});

    expect(sent).toEqual({contentType: 'application/json', body: '{"id":7}'});
  });
});
