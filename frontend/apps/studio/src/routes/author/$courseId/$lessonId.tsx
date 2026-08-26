import {Typography} from '@mui/material';
import {createFileRoute} from '@tanstack/react-router';

import {Loading} from '@code-dot-org/lab';

import {
  registerAuthoringMswBridge,
  useAuthoringState,
} from '@/modules/authoring';
import LessonPlayer from '@/modules/authoring/components/LessonPlayer';
import LabProviders from '@/modules/labs/LabProviders';

import styles from '@/modules/authoring/components/authoring.module.scss';

export const Route = createFileRoute('/author/$courseId/$lessonId')({
  // The player is full-height; keep the footer out like the lab route does.
  staticData: {hideFooter: true},
  loader: () => registerAuthoringMswBridge(),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LabProviders>
      <LessonRoute />
    </LabProviders>
  );
}

function LessonRoute() {
  const {courseId, lessonId} = Route.useParams();
  const {data, isLoading} = useAuthoringState();

  if (isLoading) {
    return <Loading isLoading />;
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
