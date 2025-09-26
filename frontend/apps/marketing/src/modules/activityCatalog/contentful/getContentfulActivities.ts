import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

/**
 * Retrieves all activities from Contentful.
 * @returns A promise that resolves to an array of activity entries.
 */
export async function getContentfulActivities() {
  const contentfulClient = getContentfulClient();

  if (!contentfulClient) {
    console.warn(
      '⚠️ Contentful client is not available. Please check that frontend/apps/marketing/.env is populated.',
    );
    return [];
  }

  return getAllEntriesForContentType<Entry<Activity>>(
    contentfulClient,
    'curriculum',
  );
}
