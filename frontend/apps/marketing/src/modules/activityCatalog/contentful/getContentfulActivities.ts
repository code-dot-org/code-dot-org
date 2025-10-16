import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

/**
 * Retrieves all activities from Contentful.
 * @param activityType The type of activities to retrieve (e.g., 'hour-of-ai', 'hour-of-code').
 * @returns A promise that resolves to an array of activity entries.
 */
export async function getContentfulActivities(activityType: string) {
  const contentfulClient = getContentfulClient();

  if (!contentfulClient) {
    console.warn(
      '⚠️ Contentful client is not available. Please check that frontend/apps/marketing/.env is populated.',
    );
    return [];
  }
  console.log('Fetching activities for activityType:', activityType);
  return getAllEntriesForContentType<Entry<Activity>>(
    contentfulClient,
    'curriculum',
    {'metadata.tags.sys.id[in]': [activityType]},
  );
}
