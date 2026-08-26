import {Typography} from '@mui/material';
import {createFileRoute, Link} from '@tanstack/react-router';

import {Loading} from '@code-dot-org/lab';

import {
  registerAuthoringMswBridge,
  useAuthoringState,
  useCanAuthor,
} from '@/modules/authoring';
import AuthorSidebar from '@/modules/authoring/components/AuthorSidebar';
import LabProviders from '@/modules/labs/LabProviders';

import styles from '@/modules/authoring/components/authoring.module.scss';

export const Route = createFileRoute('/author/')({
  loader: () => registerAuthoringMswBridge(),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LabProviders>
      <CourseList />
    </LabProviders>
  );
}

/** Curriculum home: every course in the authoring workspace. */
function CourseList() {
  const {data, isLoading, error} = useAuthoringState();
  const canAuthor = useCanAuthor();

  if (isLoading) {
    return <Loading isLoading />;
  }
  if (error || !data) {
    return (
      <div className={styles.coursePage}>
        <Typography variant="h4">Curriculum</Typography>
        <Typography variant="body1">
          The authoring service isn’t reachable. Start it with
          `yarn workspace @code-dot-org/authoring-service dev`.
        </Typography>
      </div>
    );
  }

  const content = (
    <div className={styles.courseScroll}>
      <div className={styles.coursePage}>
        <Typography variant="h4" component="h1">
          Curriculum
        </Typography>
        <div className={styles.courseCardGrid}>
          {data.courses.map(course => (
            <Link
              key={course.id}
              to="/author/$courseId"
              params={{courseId: course.id}}
              className={styles.courseCard}
            >
              <span className={styles.originBadge}>
                <Typography variant="body4">
                  {course.origin === 'levelbuilder'
                    ? 'Levelbuilder import'
                    : 'Draft'}
                </Typography>
              </span>
              <Typography variant="h6" component="h2">
                {course.displayName}
              </Typography>
              <Typography variant="body2">
                {course.gradeLevels ? `Grades ${course.gradeLevels} · ` : ''}
                {course.units.length} unit{course.units.length === 1 ? '' : 's'}
                {' · '}
                {course.units.reduce((n, u) => n + u.lessons.length, 0)} lessons
              </Typography>
            </Link>
          ))}
        </div>
        {data.courses.length === 0 && (
          <Typography variant="body1">
            No courses yet — ask the AI to create one.
          </Typography>
        )}
      </div>
    </div>
  );

  if (!canAuthor) {
    return content;
  }
  return (
    <div className={`${styles.courseLayout} ${styles.courseLayoutAuthor}`}>
      {content}
      <AuthorSidebar scope={{}} scopeLabel="All curriculum" />
    </div>
  );
}
