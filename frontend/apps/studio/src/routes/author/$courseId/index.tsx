import {Typography} from '@mui/material';
import {createFileRoute, Link} from '@tanstack/react-router';

import {Loading} from '@code-dot-org/lab';

import AuthorSidebar from '@/modules/authoring/components/AuthorSidebar';
import styles from '@/modules/authoring/components/authoring.module.scss';
import {
  registerAuthoringMswBridge,
  useAuthoringState,
  useCanAuthor,
} from '@/modules/authoring';
import LabProviders from '@/modules/labs/LabProviders';

export const Route = createFileRoute('/author/$courseId/')({
  loader: () => registerAuthoringMswBridge(),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LabProviders>
      <CourseOverview />
    </LabProviders>
  );
}

/** Course overview: units and lesson outlines, learner-styled. */
function CourseOverview() {
  const {courseId} = Route.useParams();
  const {data, isLoading} = useAuthoringState();
  const canAuthor = useCanAuthor();

  if (isLoading) {
    return <Loading isLoading />;
  }
  const course = data?.courses.find(c => c.id === courseId);
  if (!course) {
    return (
      <div className={styles.coursePage}>
        <Typography variant="h5">Course not found: {courseId}</Typography>
      </div>
    );
  }

  const content = (
    <div className={styles.courseScroll}>
      <div className={styles.coursePage}>
        <div>
          <Link to="/author">
            <Typography variant="body4">← All curriculum</Typography>
          </Link>
          <Typography variant="h4" component="h1">
            {course.displayName}
          </Typography>
          {course.gradeLevels && (
            <Typography variant="body2">Grades {course.gradeLevels}</Typography>
          )}
        </div>
        {course.units.map(unit => (
          <section key={unit.id} className={styles.unitCard}>
            <Typography variant="h6" component="h2">
              {unit.displayName}
            </Typography>
            {unit.overview && (
              <Typography variant="body2">{unit.overview}</Typography>
            )}
            {unit.lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                to="/author/$courseId/$lessonId"
                params={{courseId: course.id, lessonId: lesson.id}}
                className={styles.lessonRow}
              >
                <Typography variant="h6" component="span">
                  {index + 1}
                </Typography>
                <span className={styles.lessonRowMain}>
                  <Typography variant="body1" component="span">
                    {lesson.displayName}
                  </Typography>
                  <Typography variant="body4" component="span">
                    {lesson.goal ??
                      `${lesson.experiences.length} activit${lesson.experiences.length === 1 ? 'y' : 'ies'}`}
                    {lesson.durationMinutes
                      ? ` · ${lesson.durationMinutes} min`
                      : ''}
                  </Typography>
                </span>
                {lesson.experiences.length === 0 && (
                  <span className={styles.originBadge}>
                    <Typography variant="body4">outline</Typography>
                  </span>
                )}
              </Link>
            ))}
          </section>
        ))}
      </div>
    </div>
  );

  if (!canAuthor) {
    return content;
  }
  return (
    <div className={`${styles.courseLayout} ${styles.courseLayoutAuthor}`}>
      {content}
      <AuthorSidebar
        scope={{courseId: course.id}}
        scopeLabel={course.displayName}
      />
    </div>
  );
}
