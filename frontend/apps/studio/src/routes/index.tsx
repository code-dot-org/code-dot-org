import {createFileRoute} from '@tanstack/react-router';

import StudioFooter from '@/components/footer';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Hello "/"!</div>
      <StudioFooter />
    </>
  );
}
