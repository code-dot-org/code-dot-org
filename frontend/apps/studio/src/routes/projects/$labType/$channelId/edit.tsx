import {createFileRoute} from '@tanstack/react-router';

// `createFileRoute` automatically sets the route's id and path based on the file path
// There is no need to manually edit this, it is done via the Tanstack Router Vite plugin
// See: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#anatomy-of-a-route
export const Route = createFileRoute('/projects/$labType/$channelId/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const {channelId, labType} = Route.useParams();
  return (
    <div>
      Lab Type: {labType}, Channel ID: {channelId}
    </div>
  );
}
