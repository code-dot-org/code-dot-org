// Root component for the /ai_lessons SPA.  Sits inside the RouterProvider
// in the entry shim; reads the current route and renders the matching
// page.  Each page component is responsible for fetching its own data.

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import React, {useEffect} from 'react';

import AuthorPage from './AuthorPage';
import {applyDemoTheme, loadDemoSettings} from './demoSettings';
import LessonsListPage from './LessonsListPage';
import {useRouter} from './router';
import StudentPage from './StudentPage';
import TeacherProgressPage from './TeacherProgressPage';

import styles from './aiLessons.module.scss';

const AiLessonsApp: React.FC = () => {
  const {route} = useRouter();
  const {setTheme} = useTheme();

  // The ThemeProvider always boots Light; re-apply the presenter's saved
  // demo theme (see demoSettings) once on mount so the provider and the
  // document agree.
  useEffect(() => {
    applyDemoTheme(loadDemoSettings().theme, setTheme);
  }, [setTheme]);

  switch (route.kind) {
    case 'index':
      return <LessonsListPage />;
    case 'new':
      return <AuthorPage mode="new" />;
    case 'edit':
      return <AuthorPage mode="edit" lessonId={route.lessonId} />;
    case 'show':
      return <StudentPage lessonId={route.lessonId} />;
    case 'progress':
      return <TeacherProgressPage />;
    case 'not-found':
      return (
        <div className={styles.listPage}>
          <header className={styles.authorHeader}>
            <h1>Not found</h1>
            <p className={styles.muted}>
              No AI Lessons page at <code>{route.path}</code>.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="/ai_lessons">
                ← Back to lessons
              </a>
            </div>
          </header>
        </div>
      );
  }
};

export default AiLessonsApp;
