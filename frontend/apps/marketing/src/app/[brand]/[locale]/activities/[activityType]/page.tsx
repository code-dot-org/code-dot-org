import { Results, search } from '@orama/orama';
import { persist } from '@orama/plugin-data-persistence';
import { notFound } from 'next/navigation';

import ActivityCatalog from '@/components/contentful/activityCatalog';
import { Brand } from '@/config/brand';
import { getContentfulActivities } from '@/modules/activityCatalog/contentful/getContentfulActivities';
import { createDatabase } from '@/modules/activityCatalog/orama/createDatabase';
import { Activity } from '@/modules/activityCatalog/types/Activity';
import { Entry } from '@/types/contentful/Entry';

export const revalidate = 3600;

export async function generateStaticParams() {
  // If you’re not prebuilding anything yet, returning [] is fine.
  return [];
}

enum ActivityType {
  HOUR_OF_AI = 'hour-of-ai',
  HOUR_OF_CODE = 'hour-of-code',
}

const ValidActivityTypes = new Set<string>(Object.values(ActivityType));

/**
 * Server-rendered Activities Page
 * - Fetches activities from Contentful
 * - Builds an Orama DB
 * - Passes serialized DB + facets + all activities to the client component
 */
export default async function ActivitiesPage({
  params: { brand, locale, activityType },
}: {
  params: { brand: string; locale: string; activityType: string };
}) {
  // This page is only available for CS For All brand
  if (brand !== Brand.CS_FOR_ALL || !ValidActivityTypes.has(activityType)) {
    return notFound();
  }

  // Fetch activities from Contentful
  const contentfulActivities = await getContentfulActivities();

  // Create Orama database from Contentful activities
  const db = createDatabase(
    contentfulActivities as unknown as Entry<Activity>[]
  );

  /** Serializes the Orama database for client-side use */
  const getSerializedOramaDatabase = async () => {
    return await persist(db, 'json');
  };

  /** Finds all unique values for each facet in the Orama database */
  const getSearchFacets = async () => {
    const facetResults: Results<Activity> = await search(db, {
      facets: {
        ages: {},
        topic: {},
        activityType: {},
        languageProgramming: {},
        length: {},
        accessibilitys: {},
        technologyClassroom: {},
      },
    });
    return facetResults.facets;
  };

  /** Fetches all activities from the Orama database */
  const getAllActivities = async () => {
    const allActivityResults = await search(db, { term: '' });
    return allActivityResults.hits.map(hit => hit.document);
  };

  return (
    <section style={{ display: 'flex' }}>
      <ActivityCatalog
        serializedOramaDb={await getSerializedOramaDatabase()}
        activities={await getAllActivities()}
        facets={await getSearchFacets()}
      />
    </section>
  );
}
