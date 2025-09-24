import {Box} from '@mui/material';
import {Results, search} from '@orama/orama';
import {persist} from '@orama/plugin-data-persistence';
import {notFound} from 'next/navigation';

import ActivityCatalog from '@/components/contentful/ActivityCatalog';
import ActivitiesHero from '@/components/contentful/ActivityCatalog/activitiesHero';
import {Brand} from '@/config/brand';
import {getContentfulActivities} from '@/modules/activityCatalog/contentful/getContentfulActivities';
import {createDatabase} from '@/modules/activityCatalog/orama/createDatabase';
import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

enum ActivityType {
  HOUR_OF_AI = 'hour-of-ai',
  HOUR_OF_CODE = 'hour-of-code',
}

const ValidActivityTypes = new Set<string>(Object.values(ActivityType));

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{brand: string; activityType: string}>;
}) {
  const {brand, activityType} = await params;

  if (brand !== Brand.CS_FOR_ALL || !ValidActivityTypes.has(activityType)) {
    return notFound();
  }

  const contentfulActivities = await getContentfulActivities();
  const db = createDatabase(
    contentfulActivities as unknown as Entry<Activity>[],
  );
  const serializedOramaDb = (await persist(db, 'json')) as
    | string
    | ArrayBuffer
    | Buffer<ArrayBufferLike>;

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

  const allActivityResults = await search(db, {term: ''});
  const allActivities = allActivityResults.hits.map(h => h.document);

  return (
    <main>
      <ActivitiesHero />
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: {xs: 2, md: 4},
          pb: {xs: 2, md: 8},
        }}
      >
        <ActivityCatalog
          serializedOramaDb={serializedOramaDb}
          activities={allActivities}
          facets={facetResults.facets}
        />
      </Box>
    </main>
  );
}
