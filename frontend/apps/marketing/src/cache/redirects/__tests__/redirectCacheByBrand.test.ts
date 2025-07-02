import {Brand} from '@/config/brand';
import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';

import redirectCacheByBrand from '../redirectCacheByBrand';
import {RedirectEntry} from '../types';

jest.mock('@/contentful/client');
jest.mock('@/contentful/get-entries');

jest.mock('next/cache', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unstable_cache: (fn: any) => fn,
}));

describe('getRedirectCacheByBrand', () => {
  const mockRedirects: RedirectEntry[] = [
    {
      brand: Brand.CODE_DOT_ORG,
      source: '/old-url',
      destination: '/new-url',
      permanent: true,
    },
    {
      brand: Brand.HOUR_OF_CODE,
      source: '/hoc-old',
      destination: '/hoc-new',
      permanent: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a cache with redirects grouped by brand', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue(
      mockRedirects.map(fields => ({fields})),
    );

    const cache = await redirectCacheByBrand();
    expect(cache[Brand.CODE_DOT_ORG]['/old-url']).toEqual(mockRedirects[0]);
    expect(cache[Brand.HOUR_OF_CODE]['/hoc-old']).toEqual(mockRedirects[1]);
    expect(cache[Brand.CS_FOR_ALL]).toEqual({});
  });

  it('returns empty caches if Contentful client is unavailable', async () => {
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);
    const cache = await redirectCacheByBrand();
    expect(cache[Brand.CODE_DOT_ORG]).toEqual({});
    expect(cache[Brand.HOUR_OF_CODE]).toEqual({});
    expect(cache[Brand.CS_FOR_ALL]).toEqual({});
  });
});
