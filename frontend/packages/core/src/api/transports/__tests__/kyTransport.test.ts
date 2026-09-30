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
