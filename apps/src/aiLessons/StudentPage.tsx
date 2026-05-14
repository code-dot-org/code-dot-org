// Student-facing AI Lessons player.
//
// Layout: a persistent AI Tutor chat on the left, the current lab embedded
// directly on the right (no iframes — the real Lab2 React view).  No header
// progress bar; the AI Tutor narrates the journey and decides when the
// student has met the success criteria.
//
// Because the lab is in our React tree, we can pull the student's live
// source out of Redux and hand it to the tutor whenever they ask to be
// checked — there is no manual "paste your code" step.  Advancement is
// gated on `action === 'advance'` returned by the tutor's structured JSON
// output, so the student cannot skip past a checkpoint they haven't met.

import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import EmbeddedLab from './EmbeddedLab';
import {
  loadProgress,
  ProgressSnapshot,
  recordProgressEvent,
} from './studentProgress';
import {
  generateTutorOpening,
  generateTutorReply,
  TutorAction,
  TutorMessage,
} from './tutor';
import {LessonPlan} from './types';
import {useAutoCheckOnRun} from './useAutoCheckOnRun';
import {useStudentWork} from './useStudentWork';

import styles from './aiLessons.module.scss';

interface StudentPageProps {
  lesson: LessonPlan;
}

type Phase = 'in-progress' | 'celebrate';

const StudentPage: React.FunctionComponent<StudentPageProps> = ({lesson}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('in-progress');
  const [history, setHistory] = useState<TutorMessage[]>([]);
  const [busy, setBusy] = useState(false);
  // Most-recently-persisted progress snapshot for this (lesson, user).
  // Kept in a ref so background save calls can append events to the
  // server-side history without race-prone state batching.
  const progressRef = useRef<ProgressSnapshot | undefined>(undefined);
  const [progressLoading, setProgressLoading] = useState<boolean>(true);
  // `evaluating` is a sub-state of `busy`: true when the tutor is actively
  // grading the student's work (auto-check on run, or Check-my-work click).
  // Lets us show "Evaluating…" instead of the general "Tutor is thinking…".
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<string>('100vh');
  const checkpoint = lesson.checkpoints[currentIndex];
  const liveWork = useStudentWork(checkpoint);

  // Size the page to fill the viewport below whatever studio chrome is
  // rendered above our React root.  Re-measure on window resize in case
  // studio banners appear/disappear.
  useEffect(() => {
    const measure = () => {
      const node = pageRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY;
      setPageHeight(`calc(100vh - ${Math.max(0, top)}px)`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Load any previously-saved progress for this (lesson, user) and resume
  // one checkpoint past the last one the student completed (clamped to the
  // last checkpoint).  Falls through to the start if nothing is saved.
  useEffect(() => {
    if (!lesson.id) {
      setProgressLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const snapshot = await loadProgress(lesson.id!);
      if (cancelled) return;
      progressRef.current = snapshot;
      if (snapshot && snapshot.lastCompletedCheckpointIndex >= 0) {
        const next = Math.min(
          snapshot.lastCompletedCheckpointIndex + 1,
          lesson.checkpoints.length - 1
        );
        setCurrentIndex(next);
      }
      setProgressLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson.id, lesson.checkpoints.length]);

  // Persist a single progress event (run or checkpoint completion) and
  // hold on to the returned snapshot so subsequent events can append to
  // its history rather than start fresh.
  const persistProgressEvent = useCallback(
    async (
      type: 'run' | 'checkpoint-completed',
      checkpointIndex: number,
      work?: string
    ) => {
      if (!lesson.id) return;
      try {
        const snapshot = await recordProgressEvent(lesson.id, {
          type,
          checkpointIndex,
          lesson,
          work,
          previous: progressRef.current,
        });
        progressRef.current = snapshot;
      } catch (e) {
        // Already logged inside recordProgressEvent; swallow here so we
        // don't surface progress-save failures to the student.

        console.warn('Progress persist failed', e);
      }
    },
    [lesson]
  );

  // Seed an opening message whenever the active checkpoint changes.
  // Wait for the saved-progress load to land first, so we don't fire an
  // opening for checkpoint 0 only to immediately throw it away when we
  // jump to the resume position.
  useEffect(() => {
    if (progressLoading) return;
    let cancelled = false;
    setHistory([]);
    setError(undefined);
    setBusy(true);
    (async () => {
      try {
        const reply = await generateTutorOpening(lesson, currentIndex);
        if (cancelled) return;
        setHistory([{role: 'tutor', text: reply.message}]);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson, currentIndex, progressLoading]);

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [history, busy]);

  const handleAdvance = (action: TutorAction) => {
    if (action === 'advance' || action === 'celebrate') {
      // Record completion before navigating so the saved snapshot points
      // at the checkpoint the student just finished.
      persistProgressEvent('checkpoint-completed', currentIndex, liveWork);
    }
    if (action === 'advance' && currentIndex < lesson.checkpoints.length - 1) {
      setCurrentIndex(i => i + 1);
    } else if (action === 'celebrate' || action === 'advance') {
      setPhase('celebrate');
    }
  };

  const requestTutorTurn = async (
    nextHistory: TutorMessage[],
    options: {evaluating?: boolean} = {}
  ) => {
    setHistory(nextHistory);
    setBusy(true);
    setEvaluating(!!options.evaluating);
    setError(undefined);
    try {
      const reply = await generateTutorReply(
        lesson,
        currentIndex,
        nextHistory,
        liveWork
      );
      setHistory(h => [...h, {role: 'tutor' as const, text: reply.message}]);
      handleAdvance(reply.action);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setEvaluating(false);
    }
  };

  // Trigger the tutor's check without injecting a synthetic student
  // chat message — the work snapshot is what the tutor actually grades.
  // We also log a `run` event to progress so the teacher's summary
  // reflects every check (auto- or manual).
  const handleCheck = useCallback(() => {
    if (busy) return;
    persistProgressEvent('run', currentIndex, liveWork);
    requestTutorTurn(history, {evaluating: true});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, history, currentIndex, lesson, liveWork, persistProgressEvent]);

  // Panels checkpoints have no source to evaluate; when the student presses
  // Continue on the last slide we just advance.  If this is the final
  // checkpoint of the lesson, fall through to the celebrate phase.
  const handlePanelsComplete = useCallback(() => {
    if (currentIndex < lesson.checkpoints.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setPhase('celebrate');
    }
  }, [currentIndex, lesson.checkpoints.length]);

  // Fire a check the moment the student hits Run/Play in the lab.
  useAutoCheckOnRun(handleCheck, !busy && phase === 'in-progress');

  if (phase === 'celebrate') {
    return (
      <div className={styles.celebrate}>
        <h1>You did it!</h1>
        <p>{lesson.title}</p>
        <p>
          <a href="/ai_lessons">Back to lessons</a>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className={styles.studentPage}
      style={{height: pageHeight}}
    >
      <aside className={styles.tutorPanel}>
        <header className={styles.tutorHeader}>
          <div className={styles.lessonTitle}>{lesson.title}</div>
          <div className={styles.checkpointMeta}>
            Step {currentIndex + 1} of {lesson.checkpoints.length} ·{' '}
            {checkpoint.title}
          </div>
          <div className={styles.demoNav}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              aria-label="Go to previous checkpoint"
              title="Demo: jump back one checkpoint"
            >
              ← Back
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                if (currentIndex < lesson.checkpoints.length - 1) {
                  setCurrentIndex(i => i + 1);
                } else {
                  setPhase('celebrate');
                }
              }}
              aria-label="Skip to next checkpoint"
              title="Demo: skip the tutor check and jump to the next checkpoint"
            >
              Skip to next →
            </button>
          </div>
        </header>

        {/* Pin the tutor's opening "Do this:" message at the top so it
            stays visible as the rest of the conversation grows.  Falls
            through to nothing while the opening is still being fetched. */}
        {history[0]?.role === 'tutor' && (
          <div className={styles.pinnedOpening}>
            <ChatMessage text={history[0].text} role={Role.ASSISTANT} />
          </div>
        )}

        <div className={styles.transcript} ref={transcriptRef}>
          {history.slice(1).map((m, i) => (
            <ChatMessage
              key={i + 1}
              text={m.text}
              role={m.role === 'tutor' ? Role.ASSISTANT : Role.USER}
            />
          ))}
          {busy && (
            <div className={styles.thinking}>
              {evaluating ? 'Evaluating…' : 'Tutor is thinking…'}
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {checkpoint.labType !== 'panels' && (
          <div className={styles.composer}>
            <MuiButton
              variant="contained"
              color="primary"
              type="button"
              onClick={handleCheck}
              disabled={busy}
              fullWidth
            >
              Check my work
            </MuiButton>
            <div className={styles.muted} style={{fontSize: 12, marginTop: 8}}>
              {checkpoint.labType === 'music'
                ? 'Pressing Play in the lab also asks the tutor to check your work.'
                : 'Tap Check my work whenever you want the tutor to evaluate what you have so far.'}
            </div>
          </div>
        )}
      </aside>

      <main className={styles.labArea}>
        <EmbeddedLab
          key={`${lesson.id || 'unsaved'}-${checkpoint.id}`}
          checkpoint={checkpoint}
          lessonId={lesson.id || ''}
          onLabComplete={handlePanelsComplete}
        />
      </main>
    </div>
  );
};

export default StudentPage;
