/**
 * @jest-environment node
 */
import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {getRedirectEntry} from '@/cache/redirects/getRedirectEntry';
import {Brand} from '@/config/brand';
import {getLocalhostDomain} from '@/config/host';

import {GET} from '../route';

jest.mock('@/cache/redirects/getRedirectEntry');
jest.mock('@/config/host');
jest.mock('@tinyhttp/etag', () => ({
  __esModule: true,
  eTag: jest.fn(() => '"mocked-etag"'),
}));

const mockGetRedirectEntry = getRedirectEntry as jest.Mock;
const mockGetLocalhostDomain = getLocalhostDomain as jest.Mock;

describe('GET /api/private/redirects/[brand]/[pathname]', () => {
  const brand: Brand = Brand.CODE_DOT_ORG;
  const pathname = '/foo';
  const params = Promise.resolve({brand, pathname});
  const makeRequest = (host = 'localhost:3000') =>
    ({
      headers: {get: (key: string) => (key === 'host' ? host : undefined)},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLocalhostDomain.mockReturnValue('localhost:3000');
  });

  it('returns 403 if host does not match getLocalhostDomain', async () => {
    const req = makeRequest('badhost:1234');
    const res = await GET(req, {params});
    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toMatch(/Invalid host/);
  });

  it('returns 400 if pathname is missing', async () => {
    const req = makeRequest();
    const res = await GET(req, {
      params: Promise.resolve({brand, pathname: ''}),
    });
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toMatch(/pathname/);
  });

  it('returns 400 if brand is missing', async () => {
    const req = makeRequest();
    const res = await GET(req, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: Promise.resolve({brand: undefined as any, pathname}),
    });
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toMatch(/brand/);
  });

  it('returns 200 and redirect not found if no redirect entry found', async () => {
    mockGetRedirectEntry.mockResolvedValue(undefined);
    const req = makeRequest();
    const res = await GET(req, {params});
    expect(res.status).toBe(200);
    const resJson = await res.json();
    expect(resJson.redirectEntry).toBeNull();
  });

  it('returns 200 and the redirect entry with correct headers', async () => {
    const entry = {destination: '/bar', permanent: true};
    mockGetRedirectEntry.mockResolvedValue(entry);
    const req = makeRequest();
    const res = await GET(req, {params});
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(
      STALE_WHILE_REVALIDATE_ONE_HOUR,
    );
    expect(res.headers.get('ETag')).toBeDefined();
    const json = await res.json();
    expect(json).toEqual({
      redirectEntry: {destination: '/bar', permanent: true},
    });
  });
});
