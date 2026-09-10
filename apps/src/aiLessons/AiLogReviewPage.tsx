// Post-playtest review of persisted AI logs, URL-only at
// /ai_lessons/ailogs (no button links here).  One block per
// (student, lesson), its sessions in start order, rows rendered through
// the same components as the in-lesson AI Log dialog.

import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {AiLogRow} from './aiLog';
import {AiLogRowList} from './AiLogDialog';
import {Link} from './router';

import styles from './aiLessons.module.scss';

interface AiLogEntry {
  lesson_id: string;
  lesson_title: string;
  user_id: number;
  user_label: string;
  // Keyed by session-start ISO timestamp; keys sort chronologically.
  sessions: {[startedAt: string]: AiLogRow[]};
}

const AiLogReviewPage: React.FunctionComponent = () => {
  const [entries, setEntries] = useState<AiLogEntry[] | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    HttpClient.get('/ai_lessons/data/ailogs')
      .then(r => r.json())
      .then((data: AiLogEntry[]) => {
        if (!cancelled) setEntries(data);
      })
      .catch(e => {
        if (!cancelled) setError(`Could not load AI logs: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = (entries || [])
    .slice()
    .sort(
      (a, b) =>
        a.user_label.localeCompare(b.user_label) ||
        a.lesson_title.localeCompare(b.lesson_title)
    );

  return (
    <div className={styles.listPage}>
      <header className={styles.authorHeader}>
        <h1>AI Logs</h1>
        <p className={styles.muted}>
          Every persisted AI interaction, per student and lesson. Sessions are
          separated by when the page was opened; a restart or return starts a
          new session.
        </p>
        <div className={styles.actions}>
          <Link className={styles.secondaryButton} href="/ai_lessons">
            ← Back to lessons
          </Link>
        </div>
      </header>
      {error && <div className={styles.error}>{error}</div>}
      {entries === undefined ? (
        <p className={styles.muted}>Loading AI logs…</p>
      ) : sorted.length === 0 ? (
        <p className={styles.muted}>No AI logs recorded yet.</p>
      ) : (
        sorted.map(entry => {
          const sessionKeys = Object.keys(entry.sessions).sort();
          return (
            <details
              key={`${entry.lesson_id}-${entry.user_id}`}
              className={styles.aiLogReviewEntry}
            >
              <summary>
                <span className={styles.aiLogReviewEntryTitle}>
                  {entry.user_label}
                </span>
                <span className={styles.muted}>
                  {' '}
                  — {entry.lesson_title} · {sessionKeys.length}{' '}
                  {sessionKeys.length === 1 ? 'session' : 'sessions'}
                </span>
              </summary>
              {sessionKeys.map(startedAt => (
                <details
                  key={startedAt}
                  open
                  className={styles.aiLogReviewSession}
                >
                  <summary className={styles.aiLogSessionHeader}>
                    Session started {new Date(startedAt).toLocaleString()}
                  </summary>
                  <div className={styles.aiLogReviewRows}>
                    <AiLogRowList rows={entry.sessions[startedAt]} />
                  </div>
                </details>
              ))}
            </details>
          );
        })
      )}
    </div>
  );
};

export default AiLogReviewPage;
