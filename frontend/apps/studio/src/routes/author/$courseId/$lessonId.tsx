import {Typography} from '@mui/material';
import {createFileRoute} from '@tanstack/react-router';

import {Loading} from '@code-dot-org/lab/host';

import {useAuthoringState} from '@/modules/authoring';
import AuthorRouteError from '@/modules/authoring/components/AuthorRouteError';
import LessonPlayer from '@/modules/authoring/components/LessonPlayer';

import styles from '@/modules/authoring/components/authoring.module.scss';

export const Route = createFileRoute('/author/$courseId/$lessonId')({
  // The player is full-height; keep the footer out like the lab route does.
  staticData: {hideFooter: true},
  component: LessonRoute,
  errorComponent: AuthorRouteError,
});

function LessonRoute() {
  const {courseId, lessonId} = Route.useParams();
  const {data, isLoading} = useAuthoringState();

  if (isLoading) {
    return <Loading />;
  }
  const course = data?.courses.find(c => c.id === courseId);
  const unit = course?.units.find(u => u.lessons.some(l => l.id === lessonId));
  const lesson = unit?.lessons.find(l => l.id === lessonId);

  if (!course || !unit || !lesson) {
    return (
      <div className={styles.coursePage}>
        <Typography variant="h5">Lesson not found</Typography>
      </div>
    );
  }

  return <LessonPlayer course={course} unit={unit} lesson={lesson} />;
}
