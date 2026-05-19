// Teacher-facing roll-up of every student we have progress data for,
// grouped by student.  Each student's card lists the lessons they've
// touched, where they are in each (last completed checkpoint vs total),
// and the latest LLM-generated summary written for the teacher.
//
// Hackathon scope: no section/class filtering, no enrolment model — we
// just show the union of (lesson, user) pairs that have a progress file
// on disk.  Sorted most-recently-active first.

import React, {useEffect, useMemo, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {Link} from './router';

import styles from './aiLessons.module.scss';

interface TeacherProgressEntry {
  user_id: number;
  user_label: string;
  lesson_id: string;
  lesson_title: string;
  lesson_objective?: string;
  total_checkpoints: number;
  last_completed_checkpoint_index: number;
  last_completed_checkpoint_id?: string;
  summary: string;
  updated_at: string;
}

interface StudentGroup {
  user_id: number;
  user_label: string;
  most_recent_at: string;
  lessons: TeacherProgressEntry[];
}

function groupByStudent(entries: TeacherProgressEntry[]): StudentGroup[] {
  const byUser = new Map<number, StudentGroup>();
  for (const entry of entries) {
    let group = byUser.get(entry.user_id);
    if (!group) {
      group = {
        user_id: entry.user_id,
        user_label: entry.user_label,
        most_recent_at: entry.updated_at,
        lessons: [],
      };
      byUser.set(entry.user_id, group);
    }
    group.lessons.push(entry);
    if (entry.updated_at > group.most_recent_at) {
      group.most_recent_at = entry.updated_at;
    }
  }
  // Sort lessons within a group most-recent-first, and groups
  // most-recently-active-first.
  for (const group of byUser.values()) {
    group.lessons.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
  return Array.from(byUser.values()).sort((a, b) =>
    b.most_recent_at.localeCompare(a.most_recent_at)
  );
}

function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const diffMs = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return 'just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 30 * day) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(then).toLocaleDateString();
}

const TeacherProgressPage: React.FunctionComponent = () => {
  // Fetches the full roll-up on mount.  No streaming / pagination — the
  // hackathon dataset is small enough.
  const [entries, setEntries] = useState<TeacherProgressEntry[] | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    HttpClient.get('/ai_lessons/data/progress')
      .then(r => r.json())
      .then((data: TeacherProgressEntry[]) => {
        if (!cancelled) setEntries(data);
      })
      .catch(e => {
        if (!cancelled) setError(`Could not load progress: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => groupByStudent(entries || []), [entries]);

  return (
    <div className={styles.listPage}>
      <header className={styles.authorHeader}>
        <h1>Student progress</h1>
        <p className={styles.muted}>
          Every student we have progress data for, across all AI Lessons. The
          summary under each lesson is an AI-generated recap of what the student
          has been doing, refreshed each time they run their work or complete a
          checkpoint.
        </p>
        <div className={styles.actions}>
          <Link className={styles.secondaryButton} href="/ai_lessons">
            ← Back to lessons
          </Link>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {entries === undefined ? (
        <p className={styles.muted}>Loading progress…</p>
      ) : groups.length === 0 ? (
        <p className={styles.muted}>
          No student progress yet. As students run their work or complete
          checkpoints, they'll appear here.
        </p>
      ) : (
        <ul className={styles.lessonList}>
          {groups.map(group => (
            <li key={group.user_id} className={styles.lessonRow}>
              <div className={styles.studentHeader}>
                <strong>{group.user_label}</strong>
                <span className={styles.muted}>
                  Last active {formatRelative(group.most_recent_at)}
                </span>
              </div>
              <ul className={styles.studentLessons}>
                {group.lessons.map(entry => (
                  <li
                    key={`${entry.lesson_id}-${entry.user_id}`}
                    className={styles.studentLessonRow}
                  >
                    <div className={styles.studentLessonHead}>
                      <Link href={`/ai_lessons/${entry.lesson_id}`}>
                        <strong>{entry.lesson_title}</strong>
                      </Link>
                      <span className={styles.muted}>
                        Checkpoint{' '}
                        {Math.max(0, entry.last_completed_checkpoint_index + 1)}{' '}
                        of {entry.total_checkpoints} ·{' '}
                        {formatRelative(entry.updated_at)}
                      </span>
                    </div>
                    {entry.lesson_objective && (
                      <div className={styles.muted}>
                        <em>{entry.lesson_objective}</em>
                      </div>
                    )}
                    <p className={styles.studentSummary}>
                      {entry.summary || 'No summary yet.'}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherProgressPage;
