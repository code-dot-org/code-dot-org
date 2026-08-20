import {createFileRoute} from '@tanstack/react-router';

import {Lab} from '@code-dot-org/lab/host';

import {getLabRouteData} from '@/modules/labs/router/getLabRouteData';

export const Route = createFileRoute('/projects/$labType/$channelId/view')({
  loader: async ({params: {labType, channelId}}) =>
    getLabRouteData(labType, channelId),
  component: RouteComponent,
});

function RouteComponent() {
  const {LabEntrypoint} = Route.useLoaderData();
  const {channelId} = Route.useParams();

  return (
    <Lab>
      <LabEntrypoint channelId={channelId} readOnly />
    </Lab>
  );
}
