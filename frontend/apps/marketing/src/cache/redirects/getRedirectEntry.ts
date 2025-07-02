import redirectCacheByBrandPromise from '@/cache/redirects/redirectCacheByBrand';
import {RedirectEntry} from '@/cache/redirects/types';
import {Brand} from '@/config/brand';

/**
 * Fetches a redirect entry by pathname and brand from the redirect cache.
 * The redirect cache by brand is loaded asynchronously via the Nextjs internal data cache
 * @param pathname - The pathname to look up in the redirect cache
 * @param brand - The brand to look up in the redirect cache
 */
export async function getRedirectEntry(
  pathname: string,
  brand: Brand,
): Promise<RedirectEntry | undefined> {
  const redirectCacheByBrand = await redirectCacheByBrandPromise();

  const redirectCache = redirectCacheByBrand?.[brand];

  return redirectCache?.[pathname];
}
