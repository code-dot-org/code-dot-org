import {createFileRoute, notFound} from '@tanstack/react-router';
import {Suspense} from 'react';

import {getLabEntrypoint} from '@/modules/labs/router/getLabEntrypoint';

// `createFileRoute` automatically sets the route's id and path based on the file path
// There is no need to manually edit this, it is done via the Tanstack Router Vite plugin
// See: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#anatomy-of-a-route
export const Route = createFileRoute('/projects/$labType/$channelId/edit')({
  loader: async ({params: {labType}}) => {
    // Lazy load each lab's entrypoint to ensure each lab's code is only loaded when needed.
    // This causes each lab to be code-split into its own chunk.
    const LabEntrypoint = getLabEntrypoint(labType);

    if (!LabEntrypoint) {
      throw notFound();
    }

    return {LabEntrypoint};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {LabEntrypoint} = Route.useLoaderData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LabEntrypoint />
    </Suspense>
  );
}
