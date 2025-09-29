import {create, insertMultiple, Orama} from '@orama/orama';

import {ActivitySchema} from '@/modules/activityCatalog/orama/schema/ActivitySchema';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {Entry} from '@/types/contentful/Entry';

/**
 * Creates an Orama database from an array of Contentful activity entries.
 * @param activities - An array of Contentful activity entries.
 * @returns An Orama database instance populated with the provided activities.
 */
export function createDatabase(
  activities: Entry<Activity>[],
): Orama<typeof ActivitySchema> {
  const db = create({schema: ActivitySchema});

  const oramaEntries: Activity[] = activities.map(activity => {
    const fields = activity.fields;

    return {
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
    };
  });

  insertMultiple(db, oramaEntries);

  return db;
}
