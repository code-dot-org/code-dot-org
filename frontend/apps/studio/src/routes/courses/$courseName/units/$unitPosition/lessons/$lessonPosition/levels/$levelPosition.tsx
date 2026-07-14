import {Typography} from '@mui/material';
import {createFileRoute, notFound, useRouter} from '@tanstack/react-router';
import {useCallback} from 'react';

import {
  DashboardApiClient,
  coursesKeys,
  levelsKeys,
} from '@code-dot-org/core/api';
import {Lab} from '@code-dot-org/lab/host';

import {getLabEntrypointByAppName} from '@/modules/labs/router/getLabEntrypointByAppName';
import LevelNavigation from '@/modules/labs/router/LevelNavigation';
import {
  CourseLevelNotFoundError,
  resolveCourseLevel,
} from '@/modules/labs/router/resolveCourseLevel';
import queryClient from '@/modules/router/queryClient';
// Register fish/standalone_video level kinds before the loader fetches level
// properties, so per-level fields (mode, displayName) survive the parse.
import '@/modules/labs/oceans/levelKinds';

// Lazy, once. Memoizing the promise — rather than a boolean flipped before the
// await resolves — means concurrent callers await the same in-flight
// registration instead of racing past a half-set flag.
const registration: {promise?: Promise<void>} = {};
function registerCourseFixtures(): Promise<void> {
  return (registration.promise ??= (async () => {
    const [{registerMockFixture}, {oceansCourseFixtures}] = await Promise.all([
      import('@code-dot-org/core/api/mocks'),
      import('@/modules/labs/oceans/fixtures'),
    ]);
    oceansCourseFixtures.forEach(route => registerMockFixture(route));
  })());
}

export const Route = createFileRoute(
  '/courses/$courseName/units/$unitPosition/lessons/$lessonPosition/levels/$levelPosition',
)({
  loader: async ({params}) => {
    const {
      courseName,
      lessonPosition: lessonPosStr,
      levelPosition: levelPosStr,
    } = params;
    const unitPosition = parseInt(params.unitPosition, 10);
    const lessonPosition = parseInt(lessonPosStr, 10);
    const levelPosition = parseInt(levelPosStr, 10);
    if (
      !Number.isInteger(unitPosition) ||
      !Number.isInteger(lessonPosition) ||
      !Number.isInteger(levelPosition)
    ) {
      throw notFound();
    }

    if (import.meta.env.VITE_API_MODE === 'msw') {
      await registerCourseFixtures();
    }

    const structure = await queryClient.ensureQueryData({
      queryKey: coursesKeys.structure(courseName, unitPosition),
      queryFn: () =>
        DashboardApiClient.courses.getScriptStructure({
          course: courseName,
          unitPosition,
        }),
    });

    const scriptName = structure.lessons.find(
      l => l.position === lessonPosition,
    )?.script_name;
    if (!scriptName) {
      throw notFound();
    }

    // Keyed by lesson so every level in the lesson shares one cached fetch.
    const levelPropertiesMap = await queryClient.ensureQueryData({
      queryKey: levelsKeys.properties(
        undefined,
        undefined,
        scriptName,
        lessonPosition,
      ),
      queryFn: () =>
        DashboardApiClient.levels.getLevelProperties({
          scriptName,
          lessonPosition,
        }),
    });

    const resolved = (() => {
      try {
        return resolveCourseLevel(
          structure,
          levelPropertiesMap,
          lessonPosition,
          levelPosition,
        );
      } catch (error) {
        // Only a genuine position-not-found becomes a 404; unexpected errors
        // (bugs, malformed data) propagate instead of masquerading as notFound.
        if (error instanceof CourseLevelNotFoundError) {
          throw notFound();
        }
        throw error;
      }
    })();

    const LabEntrypoint = getLabEntrypointByAppName(
      resolved.properties.appName,
    );

    return {resolved, LabEntrypoint};
  },
  component: CourseLevelRoute,
  notFoundComponent: () => (
    // h1: this is the only heading on the page when the not-found state renders.
    <Typography variant="h5" component="h1" sx={{p: 4}}>
      Level not found.
    </Typography>
  ),
});

function CourseLevelRoute() {
  const {resolved, LabEntrypoint} = Route.useLoaderData();
  const router = useRouter();

  const onContinue = useCallback(async () => {
    try {
      await DashboardApiClient.activities.reportMilestone({
        // `userId` is a required positional segment of the milestone route that
        // the controller never reads — identity comes from `current_user`
        // (session). Pass 0, matching legacy `progressRedux`, so the real id is
        // never exposed in a network intercept. Dropping the segment is a follow-up.
        userId: 0,
        scriptLevelId: resolved.scriptLevelId,
        levelId: resolved.levelId,
        result: true,
      });
    } catch {
      // Progress is best-effort: legacy ignores milestone failures and advances
      // regardless, so a failed report must not strand the user on the level.
    }

    // Next level by array order — the same source LevelNavigation uses, so the
    // Continue button and the Next-level link never disagree.
    const currentIndex = resolved.levels.findIndex(
      l => l.position === resolved.position,
    );
    const nextLevel = resolved.levels[currentIndex + 1];
    if (nextLevel) {
      router.navigate({to: nextLevel.path});
    } else {
      // Last level: the server-provided finish link (parity), else the script
      // overview — so Continue is never a silent no-op.
      const finishUrl =
        resolved.properties.finishUrl ??
        resolved.finishLink ??
        `/s/${resolved.scriptName}`;
      window.location.href = finishUrl;
    }
  }, [resolved, router]);

  return (
    <>
      <LevelNavigation
        currentPosition={resolved.position}
        levels={resolved.levels}
      />
      <Lab
        levelId={resolved.levelId}
        levelPropertiesMap={{[String(resolved.levelId)]: resolved.properties}}
      >
        {LabEntrypoint ? (
          <LabEntrypoint onContinue={onContinue} />
        ) : (
          // h1: this is the only heading visible when no lab entrypoint exists.
          <Typography variant="h6" component="h1" sx={{p: 4}}>
            Unsupported level type: {resolved.properties.appName}
          </Typography>
        )}
      </Lab>
    </>
  );
}
