import {getStage} from '@/config/stage';

import {GET} from '../route';

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));
jest.mock('@tinyhttp/etag', () => ({
  eTag: jest.fn(() => 'mock-etag'),
}));

const getStageMock = getStage as jest.Mock;

const DISALLOW_ALL_RULE = `User-Agent: *\nDisallow: /`;

function makeRequest(host: string) {
  return {
    headers: {get: (key: string) => (key === 'host' ? host : undefined)},
  } as Request;
}

describe('robots.txt GET', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('disallows all crawling in non-canonical hostnames', async () => {
    // Not allowed canonical
    const req = makeRequest('not-canonical.com');
    const res = await GET(req);
    expect(await res.text()).toBe(DISALLOW_ALL_RULE);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/plain');
    expect(res.headers.get('Cache-Control')).toBeDefined();
  });

  it('disallows all crawling in non-production', async () => {
    jest.doMock('@/config/stage', () => ({getStage: () => 'development'}));
    const req = makeRequest('code.org');
    const res = await GET(req);
    expect(await res.text()).toBe(DISALLOW_ALL_RULE);
    expect(res.status).toBe(200);
  });

  it('returns empty response in production with allowed canonical hostname', async () => {
    getStageMock.mockReturnValue('production');
    const req = makeRequest('code.org');
    const res = await GET(req);
    expect(await res.text()).toBe('');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toEqual('text/plain');
  });
});
