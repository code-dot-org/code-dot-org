import {Brand, getBrandFromHostname} from '@/config/brand';
import {getAllEntriesForContentType} from '@/contentful/get-entries';
import {RedirectContentType} from '@/middleware/redirects/types';
import {getContentfulClient} from '@/contentful/client';

// TODO: Implement shared redis cache
// This is a temporary in-memory cache for redirects
// https://codedotorg.atlassian.net/browse/CMS-649
const redirectCacheByBrand = new Map<Brand, Map<string, string>>([
  [Brand.CODE_DOT_ORG, new Map()],
  [Brand.HOUR_OF_CODE, new Map()],
]);

async function populateRedirectCache() {
  const deliveryClient = getContentfulClient();

  if (!deliveryClient) {
    console.warn(
      '⚠️ Contentful delivery client is not available, no redirects will be cached. Please check that frontend/apps/marketing/.env is populated.',
    );
    return;
  }

  const entries = await getAllEntriesForContentType<RedirectContentType>(
    deliveryClient,
    'redirect',
  );

  for (const entry of entries) {
    const fields = entry.fields;

    const oldUrl = new URL(fields.oldUrl);
    const brand = getBrandFromHostname(oldUrl.host);
    const redirectCache = redirectCacheByBrand.get(brand);

    const newUrl = new URL(fields.newUrl);
    const destinationUrl =
      newUrl.host === brand ? newUrl.pathname : fields.newUrl;

    redirectCache!.set(oldUrl.pathname, destinationUrl);
  }

  // Log the redirect cache entries
  for (const brand of Object.values(Brand)) {
    console.log(
      `Redirect cache for ${brand}:`,
      Object.fromEntries(
        Array.from(redirectCacheByBrand.get(brand)!.entries()),
      ),
    );
  }
}

export default redirectCacheByBrand;
