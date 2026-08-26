import {Typography} from '@mui/material';
import {createFileRoute, Link} from '@tanstack/react-router';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Loading} from '@code-dot-org/lab/host';

import {useAuthoringState, useCanAuthor} from '@/modules/authoring';
import AuthorRouteError from '@/modules/authoring/components/AuthorRouteError';
import AuthorSidebar from '@/modules/authoring/components/AuthorSidebar';

import styles from '@/modules/authoring/components/authoring.module.scss';

export const Route = createFileRoute('/author/$courseId/')({
  component: CourseOverview,
  errorComponent: AuthorRouteError,
});

/** Course overview: units and lesson outlines, learner-styled. */
function CourseOverview() {
  const {courseId} = Route.useParams();
  const {data, isLoading} = useAuthoringState();
  const canAuthor = useCanAuthor();

  if (isLoading) {
    return <Loading />;
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
            <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />{' '}
            <Typography variant="body4" component="span">
              All curriculum
            </Typography>
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
                  <Tags tagsList={[{label: 'outline'}]} size="s" />
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
      <AuthorSidebar
        scope={{courseId: course.id}}
        scopeLabel={course.displayName}
      />
      {content}
    </div>
  );
}
