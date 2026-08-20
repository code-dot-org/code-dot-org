import {createFileRoute} from '@tanstack/react-router';

import {Lab} from '@code-dot-org/lab/host';

import {getLabRouteData} from '@/modules/labs/router/getLabRouteData';

// `createFileRoute` automatically sets the route's id and path based on the file path
// There is no need to manually edit this, it is done via the Tanstack Router Vite plugin
// See: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#anatomy-of-a-route
export const Route = createFileRoute('/projects/$labType/$channelId/edit')({
  loader: async ({params: {labType, channelId}}) => {
    return getLabRouteData(labType, channelId);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {LabEntrypoint} = Route.useLoaderData();
  const {channelId} = Route.useParams();

  return (
    <Lab>
      <LabEntrypoint channelId={channelId} />
    </Lab>
  );
}
