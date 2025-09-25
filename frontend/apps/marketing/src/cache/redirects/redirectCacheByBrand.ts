import {EntrySkeletonType} from 'contentful';
import {unstable_cache} from 'next/cache';

import {RedirectEntry} from '@/cache/redirects/types';
import {Brand} from '@/config/brand';
import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';

interface RedirectCache {
  [oldUrl: string]: RedirectEntry;
}

type RedirectCacheByBrand = {
  [brand in Brand]: RedirectCache;
};

async function getRedirectCacheByBrand(): Promise<RedirectCacheByBrand> {
  const redirectCacheByBrand: RedirectCacheByBrand = {
    [Brand.CODE_DOT_ORG]: {},
    [Brand.HOUR_OF_CODE]: {},
    [Brand.CS_FOR_ALL]: {},
  };

  const deliveryClient = getContentfulClient();

  if (!deliveryClient) {
    console.warn(
      '⚠️ Contentful delivery client is not available, no redirects will be available. Please check that frontend/apps/marketing/.env is populated.',
    );
    return redirectCacheByBrand;
  }

  const entries = await getAllEntriesForContentType<
    EntrySkeletonType<RedirectEntry>
  >(deliveryClient, 'redirect');

  for (const entry of entries) {
    const redirectEntry: RedirectEntry = entry.fields;

    const redirectCache = redirectCacheByBrand[redirectEntry.brand];

    if (!redirectEntry.brand) {
      continue;
    }

    redirectCache[redirectEntry.source] = redirectEntry;
  }

  return redirectCacheByBrand;
}

// When 'use cache' is released, swap out unstable_cache with 'use cache'
// See: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
// This cache does not use time-based revalidation, to update the map, publish/republish a redirect content entry
export default unstable_cache(getRedirectCacheByBrand, undefined, {
  tags: ['redirect'],
});
