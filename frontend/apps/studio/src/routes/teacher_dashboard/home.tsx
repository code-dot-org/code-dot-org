import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';

// `createFileRoute` automatically sets the route's id and path based on the file path
// There is no need to manually edit this, it is done via the Tanstack Router Vite plugin
// See: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#anatomy-of-a-route
const TeacherDashboardHome = lazy(
  () => import('@code-dot-org/teacher-dashboard'),
);

export const Route = createFileRoute('/teacher_dashboard/home')({
  component: () => (
    <Suspense fallback={<div>Loading…</div>}>
      <TeacherDashboardHome />
    </Suspense>
  ),
});
