// Root component for the /ai_lessons SPA.  Sits inside the RouterProvider
// in the entry shim; reads the current route and renders the matching
// page.  Each page component is responsible for fetching its own data.

import React from 'react';

import AuthorPage from './AuthorPage';
import LessonsListPage from './LessonsListPage';
import {useRouter} from './router';
import StudentPage from './StudentPage';
import TeacherProgressPage from './TeacherProgressPage';

import styles from './aiLessons.module.scss';

const AiLessonsApp: React.FC = () => {
  const {route} = useRouter();

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
