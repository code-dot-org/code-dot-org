import {createFileRoute, notFound} from '@tanstack/react-router';

import {getLesson} from '@/modules/guided-lesson/data';
import GuidedLesson from '@/modules/guided-lesson/GuidedLesson';

export const Route = createFileRoute('/guided-lesson/$lessonId')({
  loader: ({params: {lessonId}}) => {
    const lesson = getLesson(lessonId);
    if (!lesson) throw notFound();
    return {lesson};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {lesson} = Route.useLoaderData();
  return <GuidedLesson lesson={lesson} />;
}
