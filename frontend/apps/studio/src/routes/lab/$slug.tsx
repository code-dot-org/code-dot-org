import {createFileRoute} from '@tanstack/react-router';

import MobileLabHost from '@/modules/labs/MobileLabHost';

export const Route = createFileRoute('/lab/$slug')({
  component: RouteComponent,
});

function RouteComponent() {
  const {slug} = Route.useParams();
  return <MobileLabHost slug={slug} />;
}
