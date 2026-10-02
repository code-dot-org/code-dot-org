import {afterEach, describe, expect, it, vi} from 'vitest';

import {createKyTransport} from '../kyTransport';

function stubFetch() {
  const fetchMock = vi.fn<typeof fetch>(
    async () =>
      new Response('{}', {headers: {'content-type': 'application/json'}}),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function sentHeaders(fetchMock: ReturnType<typeof stubFetch>): Headers {
  const [input, init] = fetchMock.mock.calls[0];
  return input instanceof Request ? input.headers : new Headers(init?.headers);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the CSRF token', () => {
  const transport = () =>
    createKyTransport({
      baseUrl: 'https://studio.example.org',
      getCsrfToken: () => 'secret',
    });

  it('goes with a write to dashboard', async () => {
    const fetchMock = stubFetch();
    await transport().request({method: 'POST', url: '/things', body: {}});
    expect(sentHeaders(fetchMock).get('X-CSRF-Token')).toBe('secret');
  });

  it('goes with a write to an absolute URL on dashboard', async () => {
    const fetchMock = stubFetch();
    await transport().request({
      method: 'POST',
      url: 'https://studio.example.org/things',
      body: {},
    });
    expect(sentHeaders(fetchMock).get('X-CSRF-Token')).toBe('secret');
  });

  it('never goes to another origin', async () => {
    const fetchMock = stubFetch();
    await transport().request({
      method: 'POST',
      url: 'https://ai-gateway.example.org/',
      body: {},
    });
    expect(sentHeaders(fetchMock).get('X-CSRF-Token')).toBeNull();
  });
});

describe('a request body', () => {
  it('is JSON, unless it is a Blob, which goes as its bytes', async () => {
    const sent: {type: string | null; body: string}[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async input => {
        const request = input as Request;
        sent.push({
          type: request.headers.get('Content-Type'),
          body: await request.text(),
        });
        return new Response('{}', {
          headers: {'content-type': 'application/json'},
        });
      }),
    );
    const transport = createKyTransport({
      baseUrl: 'https://studio.example.org',
    });
    await transport.request({method: 'POST', url: '/json', body: {a: 1}});
    await transport.request({
      method: 'POST',
      url: '/bytes',
      body: new Blob(['png'], {type: 'image/png'}),
      headers: {'Content-Type': 'image/png'},
    });
    expect(sent).toEqual([
      {type: 'application/json', body: '{"a":1}'},
      {type: 'image/png', body: 'png'},
    ]);
  });
});
