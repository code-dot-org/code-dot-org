import {Brand} from '@/config/brand';

import {getRedirectEntry} from '../getRedirectEntry';
import {RedirectEntry} from '../types';

const mockRedirectCacheByBrand = jest.fn();
jest.mock('../redirectCacheByBrand', () => ({
  __esModule: true,
  default: () => mockRedirectCacheByBrand(),
}));

jest.mock('next/cache', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unstable_cache: (fn: any) => fn,
}));

describe('getRedirectEntry', () => {
  const entry: RedirectEntry = {
    brand: Brand.CODE_DOT_ORG,
    source: '/old',
    destination: '/new',
    permanent: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the redirect entry for the given brand and path', async () => {
    mockRedirectCacheByBrand.mockResolvedValue({
      [Brand.CODE_DOT_ORG]: {'/old': entry},
      [Brand.HOUR_OF_CODE]: {},
      [Brand.CS_FOR_ALL]: {},
    });
    const result = await getRedirectEntry('/old', Brand.CODE_DOT_ORG);
    expect(result).toEqual(entry);
  });

  it('returns undefined if no entry exists for the path', async () => {
    mockRedirectCacheByBrand.mockResolvedValue({
      [Brand.CODE_DOT_ORG]: {},
      [Brand.HOUR_OF_CODE]: {},
      [Brand.CS_FOR_ALL]: {},
    });
    const result = await getRedirectEntry('/not-found', Brand.CODE_DOT_ORG);
    expect(result).toBeUndefined();
  });

  it('returns undefined if no cache for the brand', async () => {
    mockRedirectCacheByBrand.mockResolvedValue({});
    const result = await getRedirectEntry('/old', Brand.CODE_DOT_ORG);
    expect(result).toBeUndefined();
  });
});
