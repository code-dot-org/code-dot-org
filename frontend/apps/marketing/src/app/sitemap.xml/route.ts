import {eTag} from '@tinyhttp/etag';
import {EmptySitemap, SitemapStream, streamToPromise} from 'sitemap';

import {STALE_WHILE_REVALIDATE_ONE_DAY} from '@/cache/constants';
import {SUPPORTED_LOCALE_CODES} from '@/config/locale';
import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';
import {SeoMetadataEntry} from '@/types/contentful/entries/SeoMetadata';
import {Entry} from '@/types/contentful/Entry';

interface SitemapEntry {
  slug: string;
  seoMetadata: SeoMetadataEntry;
}

/**
 * GET /sitemap.xml
 * Returns a sitemap for the site by querying Contentful for all experience entries and filtering out ones that are
 * excluded from indexing.
 */
export async function GET(request: Request) {
  const deliveryClient = getContentfulClient();

  if (!deliveryClient) {
    console.warn(
      '⚠️ Contentful delivery client is not available, no redirects will be available. Please check that frontend/apps/marketing/.env is populated.',
    );
    return new Response();
  }

  const hostname = `https://${request.headers.get('host')}`;

  const experienceEntries = await getAllEntriesForContentType<
    Entry<SitemapEntry>
  >(deliveryClient, process.env.CONTENTFUL_EXPERIENCE_CONTENT_TYPE_ID!, {
    'fields.slug[exists]': 'true',
    // Only include deep links one level deep (specifically the SEO Metadata)
    include: 1,
    // contentful has a very strict type, so we need to cast this to any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: 'fields.slug,fields.seoMetadata,sys.updatedAt' as any,
  });

  const sitemapStream = new SitemapStream({
    hostname,
  });

  for (const entry of experienceEntries) {
    const sitemapEntry: SitemapEntry = entry.fields;

    // Skip entries that are marked as noindex
    if (sitemapEntry.seoMetadata?.fields?.hidePageFromSearchEnginesNoindex) {
      continue;
    }

    // Skip entries without a slug
    if (!sitemapEntry.slug) {
      continue;
    }

    const slug = sitemapEntry.slug === '/' ? '' : sitemapEntry.slug;

    SUPPORTED_LOCALE_CODES.forEach(outerLocaleCode => {
      sitemapStream.write({
        url: `${outerLocaleCode}${slug}`,
        lastmod: entry.sys.updatedAt,
        changefreq: 'daily',
        links: [
          ...SUPPORTED_LOCALE_CODES.map(localeCode => ({
            lang: localeCode,
            url: `/${localeCode}${slug}`,
          })),
          // Also indicate that English is the canonical version
          {
            lang: 'x-default',
            url: `/en-US${slug}`,
          },
        ],
      });
    });
  }

  sitemapStream.end();

  try {
    const sitemap = await streamToPromise(sitemapStream);

    return new Response(sitemap, {
      headers: {
        'Cache-Control': STALE_WHILE_REVALIDATE_ONE_DAY,
        ETag: eTag(sitemap),
      },
    });
  } catch (e) {
    if (e instanceof EmptySitemap) {
      // If the sitemap is empty, we return a 404
      return new Response('Not Found', {
        status: 404,
      });
    }

    // Otherwise, rethrow the error
    throw e;
  }
}
