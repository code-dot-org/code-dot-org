import Box from '@mui/material/Box';
import {Results, search} from '@orama/orama';
import {persist} from '@orama/plugin-data-persistence';
import {notFound} from 'next/navigation';
import {Suspense} from 'react';

import ActivityCatalog from '@/components/contentful/activityCatalog';
import ActivitiesHero from '@/components/contentful/activityCatalog/activitiesHero';
import {Brand} from '@/config/brand';
import {getContentfulActivities} from '@/modules/activityCatalog/contentful/getContentfulActivities';
import {createDatabase} from '@/modules/activityCatalog/orama/createDatabase';
import {
  Activity,
  ActivityType,
  ValidActivityTypes,
} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

/**
 * Server-side rendered Activities Page.
 * Fetches activities from Contentful and then creates an Orama database,
 * and passes serialized data to the client-side ActivityCatalog component.
 */
export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{brand: string; locale: string; activityType: string}>;
}) {
  const {brand, activityType} = await params;

  // This page is only available for CS For All brand
  // Ideally this would be accomplished using App Router file system structure instead.
  if (
    brand !== Brand.CS_FOR_ALL ||
    !ValidActivityTypes.has(activityType as ActivityType)
  ) {
    return notFound();
  }

  // Fetch activities from Contentful
  const contentfulActivities = await getContentfulActivities(activityType);

  // Create Orama database from Contentful activities
  const db = createDatabase(
    contentfulActivities as unknown as Entry<Activity>[],
  );

  /**
   * Serializes the Orama database for client-side use
   */
  const getSerializedOramaDatabase = async () => {
    return await persist(db, 'json');
  };

  /**
   * Finds all unique values for each facet in the Orama database.
   */
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
      limit: 100,
    });

    return facetResults.facets;
  };

  /**
   * Fetches all activities from the Orama database.
   */
  const getAllActivities = async () => {
    const allActivityResults = await search(db, {term: '', limit: 200});

    return allActivityResults.hits.map(hit => hit.document);
  };

  return (
    <main>
      <ActivitiesHero activityType={activityType as ActivityType} />
      <Suspense>
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: {xs: 2, md: 4},
            pb: {xs: 2, md: 8},
          }}
        >
          <ActivityCatalog
            serializedOramaDb={await getSerializedOramaDatabase()}
            activities={await getAllActivities()}
            facets={await getSearchFacets()}
          />
        </Box>
      </Suspense>
    </main>
  );
}
