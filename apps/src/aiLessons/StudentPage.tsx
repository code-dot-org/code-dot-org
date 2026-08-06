// Student-facing AI Lessons player.
//
// Layout: a persistent AI Tutor chat on the left, the current lab embedded
// directly on the right (no iframes — the real Lab2 React view).  No header
// progress bar; the AI Tutor narrates the journey.
//
// Because the lab is in our React tree, we can pull the student's live
// source out of Redux and hand it to the tutor whenever they ask to be
// checked — there is no manual "paste your code" step.
//
// The tutor judges, the resolver routes: on tutor-gated steps the tutor's
// structured `advance`/`celebrate` verdict unlocks a Continue button, but
// WHERE Continue goes is always the navigation resolver's call
// (navigation.ts) — branch options, `next` rejoins, array order, or end.
// Position is tracked as a step-id path so branched playthroughs resume
// correctly.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {loadLesson} from './api';
import BuildPartnerPanel from './BuildPartnerPanel';
import EmbeddedLab from './EmbeddedLab';
import {deterministicResolver, NavDecision} from './navigation';
import QuestionFlow from './QuestionFlow';
import {Link} from './router';
import {
  AnswerRecord,
  loadInputs,
  saveAnswer,
  StudentInputs,
} from './studentInputs';
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
  // Position is a step id plus the ordered path of visited ids (ending
  // with the current step).  The array index is derived — it's what the
  // tutor prompt and progress events still speak.
  const firstStepId = lesson.steps[0]?.id || '';
  const [currentStepId, setCurrentStepId] = useState<string>(firstStepId);
  const [path, setPath] = useState<string[]>(firstStepId ? [firstStepId] : []);
  const currentIndex = Math.max(
    0,
    lesson.steps.findIndex(s => s.id === currentStepId)
  );
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
  // Every question answer the student has given, graded or not.  Feeds
  // QuestionFlow prefill and the tutor's student-context section.  The
  // ref mirrors the state so tutor calls and rapid saves read the latest
  // map without adding it to effect dependencies (which would refire the
  // opening on every answer).
  const [inputs, setInputs] = useState<StudentInputs>({});
  const inputsRef = useRef<StudentInputs>({});
  // Bumped when the AI build partner rewrites the current step's saved
  // source; part of the EmbeddedLab key, so the lab remounts and loads
  // the new source through the normal path.
  const [sourcesEpoch, setSourcesEpoch] = useState(0);
  // `evaluating` is a sub-state of `busy`: true when the tutor is actively
  // grading the student's work (auto-check on run, or Check-my-work click).
  // Lets us show "Evaluating…" instead of the general "Tutor is thinking…".
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<string>('100vh');
  const step = lesson.steps[currentIndex];
  const liveWork = useStudentWork(step);

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
  // where the student left off.  New snapshots carry the exact position
  // (currentStepId + path); older ones only have an index, so fall back
  // to one past the last completed step with a synthesized linear path.
  useEffect(() => {
    if (!lesson.id) {
      setProgressLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [snapshot, savedInputs] = await Promise.all([
        loadProgress(lesson.id!),
        loadInputs(lesson.id!),
      ]);
      if (cancelled) return;
      setInputs(savedInputs);
      inputsRef.current = savedInputs;
      progressRef.current = snapshot;
      const savedId = snapshot?.currentStepId;
      if (savedId && lesson.steps.some(s => s.id === savedId)) {
        setCurrentStepId(savedId);
        setPath(
          snapshot.path && snapshot.path.length > 0 ? snapshot.path : [savedId]
        );
      } else if (snapshot && snapshot.lastCompletedCheckpointIndex >= 0) {
        const next = Math.min(
          snapshot.lastCompletedCheckpointIndex + 1,
          lesson.steps.length - 1
        );
        setCurrentStepId(lesson.steps[next].id);
        setPath(lesson.steps.slice(0, next + 1).map(s => s.id));
      }
      setProgressLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson.id, lesson.steps]);

  // Persist a single progress event (run or checkpoint completion) and
  // hold on to the returned snapshot so subsequent events can append to
  // its history rather than start fresh.
  const persistProgressEvent = useCallback(
    async (
      type: 'run' | 'checkpoint-completed',
      checkpointIndex: number,
      work?: string,
      position?: {
        path?: string[];
        currentStepId?: string;
        branchOptionId?: string;
      }
    ) => {
      if (!lesson.id) return;
      try {
        const snapshot = await recordProgressEvent(lesson.id, {
          type,
          checkpointIndex,
          lesson,
          work,
          previous: progressRef.current,
          ...position,
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
        const reply = await generateTutorOpening(
          lesson,
          currentIndex,
          inputsRef.current
        );
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

  // Record a question answer: merge locally (state + ref), then persist
  // the whole map in the background.
  const handleAnswer = useCallback(
    (record: AnswerRecord) => {
      const merged = {...inputsRef.current, [record.questionId]: record};
      inputsRef.current = merged;
      setInputs(merged);
      if (lesson.id) {
        saveAnswer(lesson.id, merged, record);
      }
    },
    [lesson.id]
  );

  // The tutor decided this turn — surface a Continue button if the
  // student passed, but don't navigate or record yet.  The student moves
  // on (and the completion is recorded) when they press Continue.  A
  // subsequent `stay` (re-check after tweaking) clears the pending state.
  const handleAdvance = useCallback((action: TutorAction) => {
    if (action === 'advance' || action === 'celebrate') {
      setPendingAdvance(action);
    } else {
      setPendingAdvance(null);
    }
  }, []);

  // Clear any pending Continue when the active step changes.
  useEffect(() => {
    setPendingAdvance(null);
  }, [currentStepId]);

  // Apply a resolver decision to the UI.
  const navigateTo = useCallback((decision: NavDecision) => {
    if (decision.kind === 'end') {
      setPhase('celebrate');
      return;
    }
    setCurrentStepId(decision.stepId);
    setPath(p => [...p, decision.stepId]);
  }, []);

  // Complete the current step: record it, ask the resolver where to go,
  // and navigate.  `selectedOptionId` is set when completion came from a
  // multiple-choice selection whose option may carry a branch target.
  // Used by every completion source — the post-verdict Continue button,
  // unvalidated steps' Continue, panels, and the questions placeholder.
  const completeStep = useCallback(
    async (selectedOptionId?: string) => {
      setPendingAdvance(null);
      const decision = await deterministicResolver.resolveNext({
        lesson,
        currentStepId: step.id,
        path,
        selectedOptionId,
      });
      const destinationId =
        decision.kind === 'goto' ? decision.stepId : undefined;
      persistProgressEvent('checkpoint-completed', currentIndex, liveWork, {
        path: destinationId ? [...path, destinationId] : path,
        currentStepId: destinationId ?? step.id,
        branchOptionId: selectedOptionId,
      });
      navigateTo(decision);
    },
    [
      lesson,
      step,
      path,
      currentIndex,
      liveWork,
      persistProgressEvent,
      navigateTo,
    ]
  );

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
          liveWork,
          inputsRef.current
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

  // Fire a check the moment the student hits Run/Play in the lab. The
  // lab view calls our `onRun` prop (an ExtraLabProps field) from its
  // Run/Play handler — no redux digging needed.  Unvalidated steps just
  // log the run; there is nothing to evaluate.
  const handleLabRun = useCallback(() => {
    if (busy || phase !== 'in-progress') return;
    if (step.kind === 'lab' && step.validation === 'none') {
      persistProgressEvent('run', currentIndex, liveWork);
      return;
    }
    handleCheck();
  }, [
    busy,
    phase,
    step,
    currentIndex,
    liveWork,
    persistProgressEvent,
    handleCheck,
  ]);

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
              onClick={() => {
                // Demo affordance: retrace the path when there is one,
                // else fall back to the previous array position.
                if (path.length > 1) {
                  const previous = path[path.length - 2];
                  setPath(p => p.slice(0, -1));
                  setCurrentStepId(previous);
                } else if (currentIndex > 0) {
                  setCurrentStepId(lesson.steps[currentIndex - 1].id);
                }
              }}
              disabled={currentIndex === 0 && path.length <= 1}
              aria-label="Go to previous step"
              title="Demo: jump back one step"
            >
              ←
            </button>
            <span>
              Step {currentIndex + 1} of {lesson.steps.length} · {step.title}
            </span>
            <button
              type="button"
              className={styles.demoNavArrow}
              onClick={() => {
                // Demo affordance: array order on purpose (ignores
                // branch targets), so a presenter can page through every
                // step without getting caught in a hub loop.
                if (currentIndex < lesson.steps.length - 1) {
                  const next = lesson.steps[currentIndex + 1].id;
                  setCurrentStepId(next);
                  setPath(p => [...p, next]);
                } else {
                  setPhase('celebrate');
                }
              }}
              aria-label="Skip to next step"
              title="Demo: skip the tutor check and jump to the next step in authored order"
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

        {step.kind === 'lab' &&
          step.aiPrompting &&
          step.aiPrompting !== 'off' && (
            <BuildPartnerPanel
              key={step.id}
              lesson={lesson}
              step={step}
              inputs={inputs}
              onRecordPrompt={handleAnswer}
              onSourcesApplied={() => setSourcesEpoch(e => e + 1)}
            />
          )}

        {step.kind === 'lab' && (
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
                (step.validation === 'none' ? (
                  // Unvalidated step (explore / free play): no tutor
                  // gate — the student moves on whenever they're ready.
                  <MuiButton
                    variant="contained"
                    color="primary"
                    type="button"
                    size="small"
                    onClick={() => completeStep()}
                    disabled={busy}
                    className={styles.continueButton}
                  >
                    {currentIndex >= lesson.steps.length - 1 ||
                    step.next === 'end'
                      ? 'Finish lesson →'
                      : 'Continue →'}
                  </MuiButton>
                ) : pendingAdvance ? (
                  <MuiButton
                    variant="contained"
                    color="primary"
                    type="button"
                    size="small"
                    onClick={() => completeStep()}
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
        {step.kind === 'questions' ? (
          <QuestionFlow
            key={`${lesson.id || 'unsaved'}-${step.id}`}
            step={step}
            inputs={inputs}
            path={path}
            onAnswer={handleAnswer}
            onComplete={optionId => completeStep(optionId)}
            getRecommendation={question =>
              deterministicResolver.recommend(
                {
                  lesson,
                  currentStepId: step.id,
                  path,
                  inputs: inputsRef.current,
                },
                question
              )
            }
          />
        ) : (
          <EmbeddedLab
            key={`${lesson.id || 'unsaved'}-${step.id}-${sourcesEpoch}`}
            step={step}
            lesson={lesson}
            lessonId={lesson.id || ''}
            inputs={inputs}
            onLabComplete={() => completeStep()}
            onRun={handleLabRun}
          />
        )}
      </main>
    </div>
  );
};

export default StudentPage;
