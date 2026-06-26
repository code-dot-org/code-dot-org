import {createFileRoute, notFound} from '@tanstack/react-router';

import {Lab} from '@code-dot-org/lab';

import {getLabEntrypoint} from '@/modules/labs/router/getLabEntrypoint';
import {getLabFixtures} from '@/modules/labs/router/getLabFixtures';

// `createFileRoute` automatically sets the route's id and path based on the file path
// There is no need to manually edit this, it is done via the Tanstack Router Vite plugin
// See: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#anatomy-of-a-route
export const Route = createFileRoute('/projects/$labType/$channelId/edit')({
  loader: async ({params: {labType, channelId}}) => {
    // Lazy load each lab's entrypoint to ensure each lab's code is only loaded when needed.
    // This causes each lab to be code-split into its own chunk.
    const LabEntrypoint = getLabEntrypoint(labType);

    if (!LabEntrypoint) {
      throw notFound();
    }

    // In MSW mode, register the lab's fixtures and select the scenario from
    // the channelId slot (which doubles as the fixture tag) before the lab
    // mounts. The worker, already running from `enableMocks`, will then
    // intercept the lab's initial fetches.
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
