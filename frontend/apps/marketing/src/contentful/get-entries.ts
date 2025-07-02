import {ContentfulClientApi, Entry, EntrySkeletonType} from 'contentful';

import logger from '@/logger/contentful';

/**
 * Fetches all entries for a given content type from Contentful.
 * @param client - The Contentful client to use for fetching entries (preview or delivery)
 * @param contentType - The content type to fetch all entries for
 */
export async function getAllEntriesForContentType<
  EntrySkeleton extends EntrySkeletonType = EntrySkeletonType,
>(client: ContentfulClientApi<undefined>, contentType: string) {
  logger.info(`Fetching all entries for content type: ${contentType}`, {
    contentType,
  });

  const allEntries: Entry<EntrySkeleton, undefined>[] = [];
  const pageSize = 100;
  let skip = 0;
  let total = 0;

  do {
    const response = await client.getEntries<EntrySkeleton>({
      content_type: contentType,
      skip,
      limit: pageSize,
    });

    allEntries.push(...response.items);
    total = response.total;
    skip += pageSize;
  } while (allEntries.length < total);

  logger.info(`Fetched ${allEntries.length} entries`, {contentType});

  return allEntries;
}
