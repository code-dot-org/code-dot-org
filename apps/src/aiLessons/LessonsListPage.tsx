// Minimal list of saved AI lessons.  Fetches the list itself on mount
// (we're in a client-routed SPA — the Rails action just renders the
// shell).

import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {deleteLesson, resetLessonProgress} from './api';
import {Link} from './router';
import {LessonIndexEntry} from './types';

import styles from './aiLessons.module.scss';

const LessonsListPage: React.FunctionComponent = () => {
  const [lessons, setLessons] = useState<LessonIndexEntry[] | undefined>();
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [resettingId, setResettingId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    HttpClient.get('/ai_lessons/data/lessons')
      .then(r => r.json())
      .then((data: LessonIndexEntry[]) => {
        if (!cancelled) setLessons(data);
      })
      .catch(e => {
        if (!cancelled) setError(`Could not load lessons: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = async (lesson: LessonIndexEntry) => {
    const label = lesson.title || '(untitled)';
    const ok = window.confirm(
      `Reset progress for "${label}"? This wipes every student's saved code and progress for this lesson. The lesson itself stays.`
    );
    if (!ok) return;
    setResettingId(lesson.id);
    setError(undefined);
    try {
      await resetLessonProgress(lesson.id);
    } catch (e) {
      setError(`Could not reset ${label}: ${(e as Error).message}`);
    } finally {
      setResettingId(undefined);
    }
  };

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
      setLessons(prev => (prev || []).filter(l => l.id !== lesson.id));
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
          <Link className={styles.primaryButton} href="/ai_lessons/new">
            + New lesson
          </Link>
          <Link className={styles.secondaryButton} href="/ai_lessons/progress">
            View student progress
          </Link>
        </div>
      </header>
      {error && <div className={styles.error}>{error}</div>}
      {lessons === undefined ? (
        <p className={styles.muted}>Loading lessons…</p>
      ) : lessons.length === 0 ? (
        <p className={styles.muted}>No lessons yet — try creating one.</p>
      ) : (
        <ul className={styles.lessonList}>
          {lessons.map(l => (
            <li key={l.id} className={styles.lessonRow}>
              <Link href={`/ai_lessons/${l.id}`}>
                <strong>{l.title || '(untitled)'}</strong>
              </Link>
              <div className={styles.muted}>{l.objective}</div>
              <div className={styles.lessonRowActions}>
                <Link href={`/ai_lessons/${l.id}`}>Open as student</Link>
                {' · '}
                <Link href={`/ai_lessons/${l.id}/edit`}>Edit</Link>
                {' · '}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => handleReset(l)}
                  disabled={resettingId === l.id}
                  aria-label={`Reset progress for ${l.title || 'lesson'}`}
                  title="Wipe saved code + progress for this lesson (demo)"
                >
                  {resettingId === l.id ? 'Resetting…' : 'Reset progress'}
                </button>
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
