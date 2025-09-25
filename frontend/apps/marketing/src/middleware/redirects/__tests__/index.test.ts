import {NextRequest} from 'next/server';

import {Brand} from '@/config/brand';

import {getBrandRedirects} from '../index';

function makeMockRequest(pathname = '/es', origin = 'http://localhost:3000') {
  return {
    nextUrl: {pathname, origin},
    headers: {get: () => 'localhost:3000'},
  } as unknown as NextRequest;
}

describe('getBrandRedirects', () => {
  it('returns undefined for unknown brand', () => {
    const request = makeMockRequest();
    const result = getBrandRedirects('UNKNOWN' as Brand, request);
    expect(result).toBeUndefined();
  });

  it('redirects /es-LA to /es', () => {
    const request = makeMockRequest(
      '/es-LA/engineering/all-the-things',
      'http://localhost:3000',
    );
    const result = getBrandRedirects(Brand.CODE_DOT_ORG, request);
    expect(result?.headers.get('Location')).toEqual(
      'http://localhost:3000/es/engineering/all-the-things',
    );
    expect(result?.status).toEqual(308);
  });

  it('redirects /zh-TW to /zh-Hant', () => {
    const request = makeMockRequest(
      '/zh-TW/engineering/all-the-things',
      'http://localhost:3000',
    );
    const result = getBrandRedirects(Brand.CODE_DOT_ORG, request);
    expect(result?.headers.get('Location')).toEqual(
      'http://localhost:3000/zh-Hant/engineering/all-the-things',
    );
    expect(result?.status).toEqual(308);
  });

  it('does not redirect for other paths', () => {
    const request = makeMockRequest('/en-US', 'http://localhost:3000');
    const result = getBrandRedirects(Brand.CODE_DOT_ORG, request);
    expect(result?.headers.get('Location')).toBeUndefined();
    expect(result?.status).toBeUndefined();
  });
});
