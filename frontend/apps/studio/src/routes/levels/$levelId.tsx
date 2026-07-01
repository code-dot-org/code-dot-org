import {createFileRoute} from '@tanstack/react-router';
import {Suspense} from 'react';

import {useApiClient, useLevelProperties} from '@code-dot-org/core/api';
import {ErrorFallbackPage, LabHost, Loading} from '@code-dot-org/lab';

import LabProviders from '@/modules/labs/LabProviders';
import {activateFixtureScenarioForLevel} from '@/modules/labs/router/activateFixtureScenario';
import {getLabEntrypoint} from '@/modules/labs/router/getLabEntrypoint';

/**
 * Optional context, supplied as search params. `scriptName` + `lessonPosition`
 * widen the level-properties fetch to the whole lesson (the `/s/.../lessons/...`
 * arm); `scriptId` scopes the load; `channelId` names the project's channel for
 * project-backed levels.
 */
interface LevelSearch {
  scriptId?: number;
  scriptName?: string;
  lessonPosition?: number;
  channelId?: string;
}

// A level addressed by its id. The lab type is *not* in the URL — it is read
// from the level's properties (`appName`), mirroring how the main app resolves
// a level. `createFileRoute` sets the path from the file path; the Tanstack
// Router Vite plugin regenerates `routeTree.gen.ts`. Don't edit by hand.
export const Route = createFileRoute('/levels/$levelId')({
  // Labs are full-bleed; suppress the global StudioFooter on this route.
  staticData: {hideFooter: true},
  validateSearch: (search: Record<string, unknown>): LevelSearch => ({
    scriptId:
      search.scriptId !== undefined ? Number(search.scriptId) : undefined,
    scriptName:
      typeof search.scriptName === 'string' ? search.scriptName : undefined,
    lessonPosition:
      search.lessonPosition !== undefined
        ? Number(search.lessonPosition)
        : undefined,
    channelId:
      typeof search.channelId === 'string' ? search.channelId : undefined,
  }),
  loader: async ({params: {levelId}}) => {
    // In MSW mode the level-properties fetch below needs the lab's fixture
    // active, but the URL doesn't name the lab. Find and activate the scenario
    // that defines this level. A real backend answers by level id, so this is
    // a no-op outside MSW.
    if (import.meta.env.VITE_API_MODE === 'msw') {
      await activateFixtureScenarioForLevel(Number(levelId));
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {levelId} = Route.useParams();
  const search = Route.useSearch();

  return (
    <Suspense fallback={<Loading isLoading />}>
      <LabProviders>
        <UnitLevelHost levelId={Number(levelId)} {...search} />
      </LabProviders>
    </Suspense>
  );
}

interface UnitLevelHostProps extends LevelSearch {
  levelId: number;
}

/**
 * Resolves the lab entrypoint from the level's own properties, then hands off to
 * the shared {@link LabHost} in unit mode. `LabHost` re-fetches the same
 * level-properties query (deduplicated by react-query), so this adds no extra
 * request; it only reads `appName` to pick which lab to mount.
 */
function UnitLevelHost({
  levelId,
  scriptId,
  scriptName,
  lessonPosition,
  channelId,
}: UnitLevelHostProps) {
  const api = useApiClient();
  const {data: levelPropertiesMap, isError} = useLevelProperties(api, {
    levelId,
    scriptName,
    lessonPosition,
  });

  if (isError) {
    return <ErrorFallbackPage message="Could not load this level." />;
  }
  if (!levelPropertiesMap) {
    return <Loading isLoading />;
  }

  const appName = levelPropertiesMap[levelId]?.appName;
  const LabEntrypoint = appName ? getLabEntrypoint(appName) : undefined;
  if (!LabEntrypoint) {
    return <ErrorFallbackPage message={`Unknown lab type: ${appName}`} />;
  }

  return (
    <LabHost
      LabEntrypoint={LabEntrypoint}
      levelId={levelId}
      scriptId={scriptId}
      scriptName={scriptName}
      lessonPosition={lessonPosition}
      channelId={channelId}
    />
  );
}
