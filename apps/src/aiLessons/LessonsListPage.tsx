// Minimal list of saved AI lessons.

import React from 'react';

import {LessonIndexEntry} from './types';

import styles from './aiLessons.module.scss';

interface LessonsListPageProps {
  lessons: LessonIndexEntry[];
}

const LessonsListPage: React.FunctionComponent<LessonsListPageProps> = ({
  lessons,
}) => {
  return (
    <div className={styles.listPage}>
      <header className={styles.authorHeader}>
        <h1>AI Lessons</h1>
        <p className={styles.muted}>
          Hackathon prototype: lessons are described by curriculum experts as
          objective + checkpoints, fleshed out by AI, and played back as a
          single seamless experience guided by AI Tutor.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="/ai_lessons/new">
            + New lesson
          </a>
        </div>
      </header>
      {lessons.length === 0 ? (
        <p className={styles.muted}>No lessons yet — try creating one.</p>
      ) : (
        <ul className={styles.lessonList}>
          {lessons.map(l => (
            <li key={l.id} className={styles.lessonRow}>
              <a href={`/ai_lessons/${l.id}`}>
                <strong>{l.title || '(untitled)'}</strong>
              </a>
              <div className={styles.muted}>{l.objective}</div>
              <div className={styles.lessonRowActions}>
                <a href={`/ai_lessons/${l.id}`}>Open as student</a>
                {' · '}
                <a href={`/ai_lessons/${l.id}/edit`}>Edit</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonsListPage;
