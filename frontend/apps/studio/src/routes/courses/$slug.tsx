import {createFileRoute, notFound} from '@tanstack/react-router';

import CoursePage from '@/modules/catalog/CoursePage';
import {COURSES} from '@/modules/catalog/courses';

export const Route = createFileRoute('/courses/$slug')({
  loader: ({params: {slug}}) => {
    const entry = COURSES.find(c => c.slug === slug);
    if (!entry) throw notFound();
    return {entry};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {entry} = Route.useLoaderData();
  return <CoursePage entry={entry} />;
}
