import {createFileRoute, notFound} from '@tanstack/react-router';

import {Lab} from '@code-dot-org/lab';

import {getLabEntrypoint} from '@/modules/labs/router/getLabEntrypoint';
import {getLabFixtures} from '@/modules/labs/router/getLabFixtures';

export const Route = createFileRoute('/projects/$labType/$channelId/edit')({
  loader: async ({params: {labType, channelId}}) => {
    const LabEntrypoint = getLabEntrypoint(labType);

    if (!LabEntrypoint) {
      throw notFound();
    }

    if (import.meta.env.VITE_API_MODE === 'msw') {
      const [{registerLabFixtures, setActiveScenario}, fixtures] =
        await Promise.all([
          import('@code-dot-org/core/api/mocks'),
          getLabFixtures(labType),
        ]);

      if (fixtures) registerLabFixtures(labType, fixtures);
      setActiveScenario({labKey: labType, tag: channelId});
    }

    return {LabEntrypoint};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {LabEntrypoint} = Route.useLoaderData();

  return (
    <Lab>
      <LabEntrypoint />
    </Lab>
  );
}
