import {create, insertMultiple, Orama} from '@orama/orama';

import {ActivitySchema} from '@/modules/activityCatalog/orama/schema/ActivitySchema';
import {
  Activity,
  OramaActivity,
} from '@/modules/activityCatalog/types/Activity';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {Entry} from '@/types/contentful/Entry';

// Ensure unsorted activities appear at the end
const FEATURED_POSITION_MAX = 999999;

/**
 * Creates an Orama database from an array of Contentful activity entries.
 * @param activities - An array of Contentful activity entries.
 * @returns An Orama database instance populated with the provided activities.
 */
export function createDatabase(
  activities: Entry<Activity>[],
): Orama<typeof ActivitySchema> {
  const db = create({schema: ActivitySchema});

  const oramaEntries: OramaActivity[] = activities.map(activity => {
    const fields = activity.fields;

    // Featured activities have a lower number and are sorted first
    // Non-featured activities get a high number (999) to sort them last
    const prefix = fields.featuredPosition
      ? String(fields.featuredPosition).padStart(3, '0')
      : FEATURED_POSITION_MAX;

    const sortKey = prefix + fields.title;

    return {
      sortKey,
      title: fields.title || '',
      image: getAbsoluteImageUrl(fields.image) || '',
      organization: fields.organization || '',
      ages: fields.ages || [],
      languageProgramming: fields.languageProgramming || [],
      shortDescription: fields.shortDescription || '',
      longDescription: fields.longDescription || '',
      technologyClassroom: fields.technologyClassroom || [],
      topic: fields.topic || [],
      activityType: fields.activityType || [],
      length: fields.length || [],
      accessibilitys: fields.accessibilitys || [],
      languagesText: fields.languagesText || '',
      standards: fields.standards || '',
      tutorialID: fields.tutorialID || '',
      // This is passed as a stringified JSON to allow the entry to be passed directly into the ActivityCollection component
      // It will be deserialized there
      primaryLinkRef: JSON.stringify(fields.primaryLinkRef),
      featuredPosition: fields.featuredPosition || FEATURED_POSITION_MAX,
    };
  });

  insertMultiple(db, oramaEntries);

  return db;
}
