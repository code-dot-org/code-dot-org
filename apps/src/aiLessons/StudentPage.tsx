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

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {loadLesson} from './api';
import EmbeddedLab from './EmbeddedLab';
import {Link} from './router';
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
  TutorOpening,
} from './tutor';
import {LessonPlan} from './types';
import {useStudentWork} from './useStudentWork';

import styles from './aiLessons.module.scss';

interface StudentPageProps {
  lessonId: string;
}

type Phase = 'in-progress' | 'celebrate';

// SafeMarkdown uses CommonMark, which collapses single newlines into
// spaces. Chat UIs typically want single newlines to render as line
// breaks; rewrite single newlines as markdown hard breaks (two trailing
// spaces + newline). Leave paragraph breaks (\n\n) and lines that
// already end in two spaces alone.
function preserveLineBreaks(text: string): string {
  return text.replace(/([^\n ])\n(?!\n)/g, '$1  \n');
}

const StudentPage: React.FunctionComponent<StudentPageProps> = ({lessonId}) => {
  // The lesson JSON is fetched on mount; until it lands we show a tiny
  // loading state instead of every downstream `lesson.*` access guarding
  // against undefined.
  const [lesson, setLesson] = useState<LessonPlan | undefined>(undefined);
  const [lessonError, setLessonError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    loadLesson(lessonId)
      .then(l => {
        if (!cancelled) setLesson(l);
      })
      .catch(e => {
        if (!cancelled) {
          setLessonError(`Could not load lesson: ${(e as Error).message}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (lessonError) {
    return (
      <div className={styles.celebrate}>
        <p className={styles.error}>{lessonError}</p>
        <p>
          <Link href="/ai_lessons">Back to lessons</Link>
        </p>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className={styles.celebrate}>
        <p className={styles.muted}>Loading lesson…</p>
      </div>
    );
  }
  return <StudentPageInner lesson={lesson} />;
};

interface StudentPageInnerProps {
  lesson: LessonPlan;
}

const StudentPageInner: React.FunctionComponent<StudentPageInnerProps> = ({
  lesson,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('in-progress');
  const [history, setHistory] = useState<TutorMessage[]>([]);
  const [busy, setBusy] = useState(false);
  // When the tutor judges the current checkpoint complete (`advance` or
  // `celebrate`), we don't navigate immediately — we surface a Continue
  // button instead so the student can read the celebratory message and
  // move on at their own pace. Cleared on checkpoint change or when a
  // subsequent tutor turn returns `stay` (e.g. the student kept tweaking
  // after passing and broke something).
  const [pendingAdvance, setPendingAdvance] = useState<TutorAction | null>(
    null
  );
  // The structured opening (welcome + instruction) for the active
  // checkpoint. Rendered in the pinned region above the chat; also
  // stitched into the LLM transcript as the first tutor turn so reply
  // turns see the same framing.
  const [opening, setOpening] = useState<TutorOpening | undefined>();
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
    setOpening(undefined);
    setError(undefined);
    setBusy(true);
    (async () => {
      try {
        const reply = await generateTutorOpening(lesson, currentIndex);
        if (cancelled) return;
        setOpening(reply);
        // Stitch the structured opening into the LLM transcript so reply
        // turns see the same framing the student saw.
        setHistory([
          {
            role: 'tutor',
            text: `${reply.welcome}\n\nDo this: ${reply.instruction}`,
          },
        ]);
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

  // The tutor decided this turn — record completion if the student
  // passed, but don't navigate.  The student moves on by pressing
  // Continue.  A subsequent `stay` (re-check after tweaking) clears
  // the pending state.
  const handleAdvance = useCallback(
    (action: TutorAction) => {
      if (action === 'advance' || action === 'celebrate') {
        persistProgressEvent('checkpoint-completed', currentIndex, liveWork);
        setPendingAdvance(action);
      } else {
        setPendingAdvance(null);
      }
    },
    [currentIndex, liveWork, persistProgressEvent]
  );

  // Clear any pending Continue when the active checkpoint changes.
  useEffect(() => {
    setPendingAdvance(null);
  }, [currentIndex]);

  const handleContinue = useCallback(() => {
    if (
      pendingAdvance === 'advance' &&
      currentIndex < lesson.checkpoints.length - 1
    ) {
      setCurrentIndex(i => i + 1);
    } else {
      setPhase('celebrate');
    }
    setPendingAdvance(null);
  }, [pendingAdvance, currentIndex, lesson.checkpoints.length]);

  const requestTutorTurn = useCallback(
    async (
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
    },
    [lesson, currentIndex, liveWork, handleAdvance]
  );

  // Trigger the tutor's check without injecting a synthetic student
  // chat message — the work snapshot is what the tutor actually grades.
  // We also log a `run` event to progress so the teacher's summary
  // reflects every check (auto- or manual).
  const handleCheck = useCallback(() => {
    if (busy) return;
    persistProgressEvent('run', currentIndex, liveWork);
    requestTutorTurn(history, {evaluating: true});
  }, [
    busy,
    history,
    currentIndex,
    liveWork,
    persistProgressEvent,
    requestTutorTurn,
  ]);

  // Student-typed question / comment: append to history and ask the tutor
  // to reply. The tutor sees the live source too so it can answer
  // questions about the student's current code.
  const [draft, setDraft] = useState('');
  const handleSendStudentMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setDraft('');
      requestTutorTurn([...history, {role: 'student', text: trimmed}]);
    },
    [busy, history, requestTutorTurn]
  );

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

  // Fire a check the moment the student hits Run/Play in the lab. The
  // lab view calls our `onRun` prop (an ExtraLabProps field) from its
  // Run/Play handler — no redux digging needed.
  const handleLabRun = useCallback(() => {
    if (!busy && phase === 'in-progress') {
      handleCheck();
    }
  }, [busy, phase, handleCheck]);

  if (phase === 'celebrate') {
    return (
      <div className={styles.celebrate}>
        <h1>You did it!</h1>
        <p>{lesson.title}</p>
        <p>
          <Link href="/ai_lessons">Back to lessons</Link>
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
            <button
              type="button"
              className={styles.demoNavArrow}
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              aria-label="Go to previous checkpoint"
              title="Demo: jump back one checkpoint"
            >
              ←
            </button>
            <span>
              Step {currentIndex + 1} of {lesson.checkpoints.length} ·{' '}
              {checkpoint.title}
            </span>
            <button
              type="button"
              className={styles.demoNavArrow}
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
              →
            </button>
          </div>
        </header>

        {/* Pin the tutor's opening (welcome + instruction) at the top so
            it stays visible as the rest of the conversation grows.
            Rendered as instructional content (not a chat bubble) so the
            student reads it as the brief for this checkpoint. */}
        {opening && (
          <div className={styles.pinnedOpening}>
            <div className={styles.pinnedOpeningWelcome}>
              <SafeMarkdown
                markdown={opening.welcome}
                openExternalLinksInNewTab
                unwrapped
              />
            </div>
            <div className={styles.pinnedOpeningInstruction}>
              <FontAwesomeV6Icon
                iconName="square-arrow-right"
                iconStyle="solid"
                className={styles.pinnedOpeningIcon}
              />
              <SafeMarkdown
                markdown={opening.instruction}
                openExternalLinksInNewTab
                unwrapped
              />
            </div>
          </div>
        )}

        <div className={styles.transcript} ref={transcriptRef}>
          {history.slice(1).map((m, i) => (
            <ChatMessage
              key={i + 1}
              text={m.role === 'tutor' ? preserveLineBreaks(m.text) : m.text}
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
            <UserMessageEditor
              userMessage={draft}
              onChange={setDraft}
              onSubmit={handleSendStudentMessage}
              disabled={busy}
              customPlaceholder="Ask the tutor a question…"
            >
              {/* The primary action lives next to the editor's submit
                  arrow. While the student is typing a question, the
                  arrow takes over and we hide the Check/Continue
                  button so it doesn't compete for attention. */}
              {draft.trim() === '' &&
                (pendingAdvance ? (
                  <MuiButton
                    variant="contained"
                    color="primary"
                    type="button"
                    size="small"
                    onClick={handleContinue}
                    disabled={busy}
                    className={styles.continueButton}
                  >
                    <span className={styles.shimmerText}>
                      {pendingAdvance === 'celebrate'
                        ? 'Finish lesson →'
                        : 'Continue →'}
                    </span>
                  </MuiButton>
                ) : (
                  <MuiButton
                    variant="outlined"
                    color="primary"
                    type="button"
                    size="small"
                    onClick={handleCheck}
                    disabled={busy}
                  >
                    Check my work
                  </MuiButton>
                ))}
            </UserMessageEditor>
          </div>
        )}
      </aside>

      <main className={styles.labArea}>
        <EmbeddedLab
          key={`${lesson.id || 'unsaved'}-${checkpoint.id}`}
          checkpoint={checkpoint}
          lessonId={lesson.id || ''}
          onLabComplete={handlePanelsComplete}
          onRun={handleLabRun}
        />
      </main>
    </div>
  );
};

export default StudentPage;
