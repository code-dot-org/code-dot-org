import {NextResponse} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {Brand, getBrandFromHostname} from '@/config/brand';

import {withRedirects} from '../withRedirects';

jest.mock('@/config/brand', () => ({
  ...jest.requireActual('@/config/brand'),
  getBrandFromHostname: jest.fn(),
}));
jest.mock('@/config/host', () => ({
  getLocalhostAddress: jest.fn(() => 'http://localhost:3000'),
}));

const mockGetBrandFromHostname = getBrandFromHostname as jest.Mock;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_RESPONSE_HEADERS: any = {
  ['ETag']: 'mocked-etag',
  ['Cache-Control']: STALE_WHILE_REVALIDATE_ONE_HOUR,
};

global.fetch = jest.fn();

describe('withRedirects middleware', () => {
  const next = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = {} as any;
  const makeRequest = (pathname = '/foo', host = 'localhost:3000') =>
    ({
      nextUrl: {pathname, origin: 'http://localhost:3000'},
      headers: {get: (key: string) => (key === 'host' ? host : undefined)},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBrandFromHostname.mockReturnValue(Brand.CODE_DOT_ORG);
  });

  it('calls next if redirect config API returns 404', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
      json: async () => ({}), // Ensure json method exists
    });
    await withRedirects(next)(makeRequest(), event);
    expect(next).toHaveBeenCalled();
  });

  it('calls next if redirect config API returns redirectEntry is null', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({redirectEntry: null}),
    });
    await withRedirects(next)(makeRequest(), event);
    expect(next).toHaveBeenCalled();
  });

  it('calls next if redirect config API returns malformed data', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({}), // missing redirectFound
    });
    await withRedirects(next)(makeRequest(), event);
    expect(next).toHaveBeenCalled();
  });

  it('permanent redirects to absolute destination with correct status', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      headers: {
        get: (header: string) => MOCK_RESPONSE_HEADERS[header],
      },
      json: async () => ({
        redirectEntry: {
          destination: 'https://external.com',
          permanent: true,
        },
      }),
    });
    const response = await withRedirects(next)(makeRequest(), event);
    expect(response).toEqual(
      NextResponse.redirect('https://external.com', {
        status: 308,
        headers: {
          'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
          ETag: 'mocked-etag',
        },
      }),
    );
  });

  it('temporary redirects to relative destination with correct status', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      headers: {
        get: (header: string) => MOCK_RESPONSE_HEADERS[header],
      },
      json: async () => ({
        redirectEntry: {destination: '/bar', permanent: false},
      }),
    });
    const response = await withRedirects(next)(makeRequest('/foo'), event);
    expect(response).toEqual(
      NextResponse.redirect('http://localhost:3000/bar', {
        status: 307,
        headers: {
          'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
          ETag: 'mocked-etag',
        },
      }),
    );
  });

  it('permanent redirects to absolute destination without ETag', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      headers: {
        get: () => undefined,
      },
      json: async () => ({
        redirectEntry: {
          destination: 'https://external.com',
          permanent: true,
        },
      }),
    });
    const response = await withRedirects(next)(makeRequest(), event);
    expect(response).toEqual(
      NextResponse.redirect('https://external.com', {
        status: 308,
        headers: {
          'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
        },
      }),
    );
  });

  it('temporary redirects to relative destination without ETag', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      headers: {
        get: () => undefined,
      },
      json: async () => ({
        redirectEntry: {
          destination: '/bar',
          permanent: false,
        },
      }),
    });
    const response = await withRedirects(next)(makeRequest('/foo'), event);
    expect(response).toEqual(
      NextResponse.redirect('http://localhost:3000/bar', {
        status: 307,
        headers: {
          'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
        },
      }),
    );
  });

  it('uses the correct brand from getBrandFromHostname', async () => {
    (getBrandFromHostname as jest.Mock).mockReturnValue('Hour of Code');
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      headers: {
        get: (header: string) => MOCK_RESPONSE_HEADERS[header],
      },
      json: async () => ({
        redirectEntry: {
          destination: '/hoc',
          permanent: false,
        },
      }),
    });
    const response = await withRedirects(next)(
      makeRequest('/hoc', 'hourofcode.com'),
      event,
    );
    expect(response).toEqual(
      NextResponse.redirect('http://localhost:3000/hoc', {
        status: 307,
        headers: {
          'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
          ETag: 'mocked-etag',
        },
      }),
    );
  });

  it('calls brand redirect only if cache returns no redirect entry (404)', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
      json: async () => ({}),
    });
    // CODE_DOT_ORG brand triggers a brand redirect for /es-LA/engineering/all-the-things
    const req = makeRequest('/es-LA/engineering/all-the-things');
    const response = await withRedirects(next)(req, event);
    // Should return a redirect response (not call next) for this brand/path
    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe(
      'http://localhost:3000/es/engineering/all-the-things',
    );
  });

  it('calls brand redirect only if cache returns no redirect entry (null)', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({redirectEntry: null}),
    });
    const req = makeRequest('/es-LA/engineering/all-the-things');
    const response = await withRedirects(next)(req, event);
    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe(
      'http://localhost:3000/es/engineering/all-the-things',
    );
  });

  it('does not call brand redirect if cache returns a redirect entry', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      headers: {
        get: (header: string) => MOCK_RESPONSE_HEADERS[header],
      },
      json: async () => ({
        redirectEntry: {
          destination: '/bar',
          permanent: false,
        },
      }),
    });
    // This path would normally trigger a brand redirect, but cache wins
    const req = makeRequest('/es/engineering/all-the-things');
    const response = await withRedirects(next)(req, event);
    expect(response).toEqual(
      NextResponse.redirect('http://localhost:3000/bar', {
        status: 307,
        headers: {
          'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
          ETag: 'mocked-etag',
        },
      }),
    );
  });

  it('redirects zh-TW to zh-Hant on the corporate site', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
      json: async () => ({}),
    });
    // CODE_DOT_ORG brand triggers a brand redirect for /es-LA/engineering/all-the-things
    const req = makeRequest('/zh-TW/engineering/all-the-things');
    const response = await withRedirects(next)(req, event);
    // Should return a redirect response (not call next) for this brand/path
    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe(
      'http://localhost:3000/zh-Hant/engineering/all-the-things',
    );
  });
});
