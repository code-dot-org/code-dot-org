// Minimal list of saved AI lessons.

import React, {useState} from 'react';

import {deleteLesson} from './api';
import {LessonIndexEntry} from './types';

import styles from './aiLessons.module.scss';

interface LessonsListPageProps {
  lessons: LessonIndexEntry[];
}

const LessonsListPage: React.FunctionComponent<LessonsListPageProps> = ({
  lessons: initialLessons,
}) => {
  const [lessons, setLessons] = useState<LessonIndexEntry[]>(initialLessons);
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleDelete = async (lesson: LessonIndexEntry) => {
    const label = lesson.title || '(untitled)';
    const ok = window.confirm(
      `Delete "${label}"? This permanently removes the lesson JSON file.`
    );
    if (!ok) return;
    setDeletingId(lesson.id);
    setError(undefined);
    try {
      await deleteLesson(lesson.id);
      setLessons(prev => prev.filter(l => l.id !== lesson.id));
    } catch (e) {
      setError(`Could not delete ${label}: ${(e as Error).message}`);
    } finally {
      setDeletingId(undefined);
    }
  };

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
      {error && <div className={styles.error}>{error}</div>}
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
                {' · '}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => handleDelete(l)}
                  disabled={deletingId === l.id}
                  aria-label={`Delete ${l.title || 'lesson'}`}
                >
                  {deletingId === l.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonsListPage;
