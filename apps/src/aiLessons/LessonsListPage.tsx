// Minimal list of saved AI lessons.  Fetches the list itself on mount
// (we're in a client-routed SPA — the Rails action just renders the
// shell).

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {deleteLesson, resetLessonProgress} from './api';
import {ADAPTIVITY_INFO} from './demoSettings';
import {Link} from './router';
import {ADAPTIVITY_ORDER, LessonIndexEntry} from './types';

import styles from './aiLessons.module.scss';

// Edit/Delete are hidden until the authoring editor and generator catch
// up with the modern lesson format (questions, hubs, arcSpec) — editing
// a modern lesson through the stale editor would mangle it.
const SHOW_AUTHORING_ACTIONS = false;

const STATUS_BADGES: {
  [status in NonNullable<LessonIndexEntry['status']>]: {
    label: string;
    className: string;
  };
} = {
  not_started: {label: 'Not started', className: 'statusNotStarted'},
  in_progress: {label: 'In progress', className: 'statusInProgress'},
  completed: {label: 'Completed', className: 'statusCompleted'},
};

const AdaptivityPills: React.FunctionComponent<{lesson: LessonIndexEntry}> = ({
  lesson,
}) => {
  const authoredDefault = lesson.adaptivity?.default ?? 'augment';
  const max = lesson.adaptivity?.max ?? authoredDefault;
  const maxIndex = ADAPTIVITY_ORDER.indexOf(max);
  return (
    <div className={styles.lessonAdaptivity}>
      <strong>Adaptivity</strong>
      <div className={styles.adaptivityPills}>
        {ADAPTIVITY_ORDER.map((mode, i) => {
          const info = ADAPTIVITY_INFO[mode];
          const isDefault = mode === authoredDefault;
          const tooltipId = `tt-adaptivity-${lesson.id}-${mode}`;
          if (i > maxIndex) {
            return (
              <WithTooltip
                key={mode}
                tooltipProps={{
                  text: `${info.blurb} Not enabled for this lesson.`,
                  tooltipId,
                  size: 'xs',
                  direction: 'onTop',
                }}
              >
                <span
                  className={styles.adaptivityPillDisabled}
                  aria-describedby={tooltipId}
                >
                  {info.label}
                </span>
              </WithTooltip>
            );
          }
          return (
            <WithTooltip
              key={mode}
              tooltipProps={{
                text: `${info.blurb} Click to open the lesson in this mode.`,
                tooltipId,
                size: 'xs',
                direction: 'onTop',
              }}
            >
              <Link
                className={
                  isDefault
                    ? styles.adaptivityPillDefault
                    : styles.adaptivityPill
                }
                href={`/ai_lessons/${lesson.id}?adaptivity=${mode}`}
                aria-describedby={tooltipId}
              >
                {info.label}
                {isDefault && (
                  <span className={styles.adaptivityDefaultTag}>default</span>
                )}
              </Link>
            </WithTooltip>
          );
        })}
      </div>
    </div>
  );
};

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
          {SHOW_AUTHORING_ACTIONS && (
            <Link className={styles.primaryButton} href="/ai_lessons/new">
              + New lesson
            </Link>
          )}
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
              <div className={styles.lessonTitleLine}>
                <Link href={`/ai_lessons/${l.id}`}>
                  <strong>{l.title || '(untitled)'}</strong>
                </Link>
                {l.status && (
                  <span
                    className={`${styles.statusBadge} ${
                      styles[STATUS_BADGES[l.status].className]
                    }`}
                  >
                    {STATUS_BADGES[l.status].label}
                  </span>
                )}
              </div>
              <div className={styles.muted}>{l.objective}</div>
              {l.standards && l.standards.length > 0 && (
                <div className={styles.lessonStandards}>
                  <strong>Standards</strong>
                  <ul>
                    {l.standards.map(s => (
                      <li key={s.id || s.text}>
                        <span className={styles.standardCheck} aria-hidden>
                          ✓
                        </span>
                        <span>
                          {s.id && <strong>{s.id}: </strong>}
                          {s.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <AdaptivityPills lesson={l} />
              <div className={styles.lessonRowActions}>
                <MuiButton
                  component={Link}
                  href={`/ai_lessons/${l.id}`}
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={
                    <FontAwesomeV6Icon
                      iconName="arrow-up-right-from-square"
                      iconStyle="solid"
                    />
                  }
                >
                  Open as student
                </MuiButton>
                {SHOW_AUTHORING_ACTIONS && (
                  <MuiButton
                    component={Link}
                    href={`/ai_lessons/${l.id}/edit`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={
                      <FontAwesomeV6Icon iconName="pencil" iconStyle="solid" />
                    }
                  >
                    Edit
                  </MuiButton>
                )}
                <WithTooltip
                  tooltipProps={{
                    text: 'Wipe saved code + progress for this lesson (demo)',
                    tooltipId: `tt-reset-${l.id}`,
                    size: 'xs',
                    direction: 'onTop',
                  }}
                >
                  <MuiButton
                    type="button"
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={
                      <FontAwesomeV6Icon
                        iconName="arrows-rotate"
                        iconStyle="solid"
                      />
                    }
                    onClick={() => handleReset(l)}
                    disabled={resettingId === l.id}
                    aria-label={`Reset progress for ${l.title || 'lesson'}`}
                    aria-describedby={`tt-reset-${l.id}`}
                  >
                    {resettingId === l.id ? 'Resetting…' : 'Reset progress'}
                  </MuiButton>
                </WithTooltip>
                {SHOW_AUTHORING_ACTIONS && (
                  <MuiButton
                    type="button"
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={
                      <FontAwesomeV6Icon
                        iconName="trash-can"
                        iconStyle="solid"
                      />
                    }
                    onClick={() => handleDelete(l)}
                    disabled={deletingId === l.id}
                    aria-label={`Delete ${l.title || 'lesson'}`}
                  >
                    {deletingId === l.id ? 'Deleting…' : 'Delete'}
                  </MuiButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonsListPage;
