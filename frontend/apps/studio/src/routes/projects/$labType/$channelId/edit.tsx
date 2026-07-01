import {createFileRoute, notFound} from '@tanstack/react-router';
import {Suspense} from 'react';

import {LabHost} from '@code-dot-org/lab';

import LabProviders from '@/modules/labs/LabProviders';
import {getLabEntrypoint} from '@/modules/labs/router/getLabEntrypoint';
import {getLabFixtures} from '@/modules/labs/router/getLabFixtures';

// `createFileRoute` automatically sets the route's id and path based on the file path
// There is no need to manually edit this, it is done via the Tanstack Router Vite plugin
// See: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#anatomy-of-a-route
export const Route = createFileRoute('/projects/$labType/$channelId/edit')({
  // Labs are full-bleed; suppress the global StudioFooter on this route.
  staticData: {hideFooter: true},
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
  const {labType, channelId} = Route.useParams();

  // Every `@code-dot-org/lab`-based lab mounts the same way: the studio host
  // provides the data-provider stack (`LabProviders`) and drives the
  // host-owned load (the shared `LabHost`), then renders the lab's own
  // entrypoint. The lab supplies the lab-specific bits itself, so there is no
  // per-lab studio container.
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LabProviders>
        <LabHost
          LabEntrypoint={LabEntrypoint}
          standaloneProjectType={labType}
          channelId={channelId}
        />
      </LabProviders>
    </Suspense>
  );
}
