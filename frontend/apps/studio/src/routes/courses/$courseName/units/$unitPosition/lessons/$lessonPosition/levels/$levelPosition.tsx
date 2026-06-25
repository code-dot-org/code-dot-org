import {Typography} from '@mui/material';
import {createFileRoute, notFound} from '@tanstack/react-router';

import {DashboardApiClient, coursesKeys} from '@code-dot-org/core/api';
import {Lab} from '@code-dot-org/lab';

import {getLabEntrypointByAppName} from '@/modules/labs/router/getLabEntrypointByAppName';
import LevelNavigation from '@/modules/labs/router/LevelNavigation';
import {resolveCourseLevel} from '@/modules/labs/router/resolveCourseLevel';
import queryClient from '@/modules/router/queryClient';

let courseFixturesRegistered = false;
async function registerCourseFixtures() {
  if (courseFixturesRegistered) return;
  courseFixturesRegistered = true;
  const [{registerMockFixture}, {oceansCourseFixtures}] = await Promise.all([
    import('@code-dot-org/core/api/mocks'),
    import('@/modules/labs/oceans/fixtures'),
  ]);
  for (const route of oceansCourseFixtures) {
    registerMockFixture(route);
  }
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

    if (import.meta.env.VITE_API_MODE === 'msw') {
      await registerCourseFixtures();
    }

    const [structure, levelPropertiesMap] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: coursesKeys.structure(courseName, unitPosition),
        queryFn: () =>
          DashboardApiClient.courses.getScriptStructure({
            course: courseName,
            unitPosition,
          }),
      }),
      queryClient.ensureQueryData({
        queryKey: coursesKeys.levelProperties(
          courseName,
          unitPosition,
          lessonPosition,
        ),
        queryFn: () =>
          DashboardApiClient.courses.getCourseLevelProperties({
            course: courseName,
            unitPosition,
            lessonPosition,
          }),
      }),
    ]);

    let resolved;
    try {
      resolved = resolveCourseLevel(
        structure,
        levelPropertiesMap,
        lessonPosition,
        levelPosition,
      );
    } catch {
      throw notFound();
    }

    const LabEntrypoint = getLabEntrypointByAppName(
      resolved.properties.appName as string,
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

  return (
    <>
      <LevelNavigation
        currentPosition={resolved.position}
        levels={resolved.levels}
      />
      <Lab
        levelId={resolved.levelId}
        levelPropertiesMap={{
          [String(resolved.levelId)]: resolved.properties as Record<
            string,
            unknown
          >,
        }}
      >
        {LabEntrypoint ? (
          <LabEntrypoint />
        ) : (
          // h1: this is the only heading visible when no lab entrypoint exists.
          <Typography variant="h6" component="h1" sx={{p: 4}}>
            Unsupported level type: {resolved.properties.appName as string}
          </Typography>
        )}
      </Lab>
    </>
  );
}
