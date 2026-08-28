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
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {recordStepMarker} from './aiLog';
import AiLogDialog from './AiLogDialog';
import {loadLesson, resetLessonProgress} from './api';
import {generateLessonArc} from './arcGenerator';
import {judgeBranchCondition} from './branchJudge';
import BuildPartnerPanel from './BuildPartnerPanel';
import ChecklistPanel from './ChecklistPanel';
import DemoSettingsDialog from './DemoSettingsDialog';
import EmbeddedLab from './EmbeddedLab';
import {
  evaluatePathMastery,
  generateRemediationSteps,
  MAX_REMEDIATION_ROUNDS,
} from './mastery';
import {
  deterministicNextStep,
  deterministicResolver,
  NavDecision,
} from './navigation';
import {generateStepObservation} from './observations';
import {
  applyOverlay,
  EMPTY_OVERLAY,
  LessonOverlay,
  loadOverlay,
  saveOverlay,
} from './overlay';
import ProgressRing from './ProgressRing';
import QuestionFlow from './QuestionFlow';
import {Link, useNavigate} from './router';
import SkillHub, {pathProgress} from './SkillHub';
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
  saveSnapshotExtras,
  StepObservation,
} from './studentProgress';
import {
  generateTutorOpening,
  generateTutorReply,
  judgeFreeResponse,
  TutorAction,
  TutorContext,
  TutorMessage,
  TutorOpening,
} from './tutor';
import {
  hubOwning,
  LessonPlan,
  pathStepsFor,
  resolveAdaptivity,
  SkillPath,
  stepShowsChecklist,
} from './types';
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
  lesson: authoredLesson,
}) => {
  // The mastery agent's per-student additions.  Merged with the
  // authored lesson into the effective lesson everything below runs on;
  // when a remediation lands mid-session, setOverlay re-merges and the
  // hub rings grow in place.
  const [overlay, setOverlay] = useState<LessonOverlay>(EMPTY_OVERLAY);
  const lesson = useMemo(
    () => applyOverlay(authoredLesson, overlay),
    [authoredLesson, overlay]
  );
  // Render-sync mirror so the background mastery chain reads the
  // freshest overlay without joining callback dependencies.
  const overlayRef = useRef<LessonOverlay>(EMPTY_OVERLAY);
  overlayRef.current = overlay;
  // The adaptivity dial: ?adaptivity=static|augment|full, clamped to
  // what the author allows.  `static` disables the mastery machinery
  // entirely — no evaluation, no generation, a classic lesson.
  //
  // An explicit URL override wins.  Without one, the mode the run
  // STARTED in (stored on the progress snapshot) is restored once
  // saved progress loads — see the load effect — so resuming a
  // full-mode run doesn't silently degrade to the authored default.
  const requestedMode = useMemo(
    () => new URLSearchParams(window.location.search).get('adaptivity'),
    []
  );
  const [adaptivityMode, setAdaptivityMode] = useState(() =>
    resolveAdaptivity(authoredLesson, requestedMode)
  );
  const adaptivityModeRef = useRef(adaptivityMode);
  adaptivityModeRef.current = adaptivityMode;
  // True while the arc generator is designing the personalized lesson
  // arc — the main area shows the generation screen instead of a step.
  const [generatingArc, setGeneratingArc] = useState(false);
  // Whether an arc has been generated (its splice override exists).
  const arcPresent = Boolean(
    authoredLesson.arcSpec &&
      overlay.nextOverrides?.[authoredLesson.arcSpec.generateAfter]
  );
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
  // True while the navigation resolver is deciding where Continue goes.
  // Usually instant, but an aiJudge branch condition is an LLM call —
  // the Continue button shows a busy label meanwhile.
  const [resolving, setResolving] = useState(false);
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
  // Step ids the student has completed, in order.  What skill-tree hubs
  // count (path rings light per completed step).  Ref mirrors state so
  // completions and persists read the latest without effect churn.
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const completedRef = useRef<string[]>([]);
  // Bumped when the AI build partner rewrites the current step's saved
  // source; part of the EmbeddedLab key, so the lab remounts and loads
  // the new source through the normal path.
  const [sourcesEpoch, setSourcesEpoch] = useState(0);
  // Latest tutor verdict per lesson-checklist item.  Ref mirrors state
  // for the same reason as inputsRef: tutor calls and progress persists
  // read the freshest map without joining effect dependencies.
  const [checklistState, setChecklistState] = useState<{
    [itemId: string]: boolean;
  }>({});
  const checklistRef = useRef<{[itemId: string]: boolean}>({});
  // Rubric-scored step observations (teacher-facing, also tutor context).
  // Ref-only — nothing student-visible renders from them.
  const observationsRef = useRef<{[stepId: string]: StepObservation}>({});
  // `evaluating` is a sub-state of `busy`: true when the tutor is actively
  // grading the student's work (auto-check on run, or Check-my-work click).
  // Lets us show "Evaluating…" instead of the general "Tutor is thinking…".
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiLogOpen, setAiLogOpen] = useState(false);
  // True while EmbeddedLab generates AI starter code for this step —
  // Continue is gated on it, so a step can't complete before the work
  // it's about exists.
  const [starterGenerating, setStarterGenerating] = useState(false);
  // Snapshot writes still in flight — the final event persist runs an
  // LLM summary and is deliberately unawaited.  The celebrate page's
  // Back link waits on these so the lesson list reads finished state,
  // not the pre-completion snapshot.
  const pendingSavesRef = useRef<Promise<unknown>[]>([]);
  const [leavingCelebrate, setLeavingCelebrate] = useState(false);
  const navigate = useNavigate();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<string>('100vh');
  const step = lesson.steps[currentIndex];
  const liveWork = useStudentWork(step);

  // The tutor's full session context, assembled fresh per call from the
  // refs so effects don't gain churning dependencies.
  // Ref mirrors the effective lesson so tutorContext can stay stable
  // across overlay merges: a remediation landing mid-step must not
  // change tutorContext's identity, or the opening effect would refire
  // for the step the student is sitting on.
  const lessonRef = useRef(lesson);
  lessonRef.current = lesson;

  const tutorContext = useCallback(
    (): TutorContext => ({
      lesson: lessonRef.current,
      currentIndex,
      studentInputs: inputsRef.current,
      checklistState: checklistRef.current,
      observations: observationsRef.current,
      mastery: progressRef.current?.mastery,
    }),
    [currentIndex]
  );

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
    if (!authoredLesson.id) {
      setProgressLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [snapshot, savedInputs, savedOverlay] = await Promise.all([
        loadProgress(authoredLesson.id!),
        loadInputs(authoredLesson.id!),
        loadOverlay(authoredLesson.id!),
      ]);
      if (cancelled) return;
      setInputs(savedInputs);
      inputsRef.current = savedInputs;
      setOverlay(savedOverlay);
      // Resume positions may point at overlay (generated) steps, so
      // resolve them against the merged plan, not the authored one.
      const merged = applyOverlay(authoredLesson, savedOverlay);
      progressRef.current = snapshot;
      // No explicit ?adaptivity= override → resume in the mode the run
      // started in.  Clamped, in case the authored max shrank since.
      if (!requestedMode && snapshot?.adaptivityMode) {
        setAdaptivityMode(
          resolveAdaptivity(authoredLesson, snapshot.adaptivityMode)
        );
      }
      const savedChecklist = snapshot?.checklist || {};
      setChecklistState(savedChecklist);
      checklistRef.current = savedChecklist;
      observationsRef.current = snapshot?.observations || {};
      const savedCompleted = snapshot?.completedStepIds || [];
      setCompletedStepIds(savedCompleted);
      completedRef.current = savedCompleted;
      const savedId = snapshot?.currentStepId;
      if (savedId && merged.steps.some(s => s.id === savedId)) {
        setCurrentStepId(savedId);
        setPath(
          snapshot.path && snapshot.path.length > 0 ? snapshot.path : [savedId]
        );
      } else if (snapshot && snapshot.lastCompletedCheckpointIndex >= 0) {
        const next = Math.min(
          snapshot.lastCompletedCheckpointIndex + 1,
          merged.steps.length - 1
        );
        setCurrentStepId(merged.steps[next].id);
        setPath(merged.steps.slice(0, next + 1).map(s => s.id));
      }
      setProgressLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // requestedMode is a mount-stable memo of the URL param.
  }, [authoredLesson, requestedMode]);

  // Persist a single progress event (run or checkpoint completion) and
  // hold on to the returned snapshot so subsequent events can append to
  // its history rather than start fresh.
  const persistProgressEvent = useCallback(
    (
      type: 'run' | 'checkpoint-completed',
      checkpointIndex: number,
      work?: string,
      position?: {
        path?: string[];
        currentStepId?: string;
        branchOptionId?: string;
        completed?: boolean;
      }
    ) => {
      if (!lesson.id) return;
      const save = (async () => {
        try {
          const snapshot = await recordProgressEvent(lesson.id!, {
            type,
            checkpointIndex,
            lesson,
            work,
            previous: progressRef.current,
            // Ride the latest checklist verdicts and completion set on
            // every event so updates between events aren't lost for long.
            checklist: checklistRef.current,
            completedStepIds: completedRef.current,
            // Stamp the run's mode so the very first snapshot carries
            // it — resume restores it (see the load effect).
            adaptivityMode: adaptivityModeRef.current,
            ...position,
          });
          progressRef.current = snapshot;
        } catch (e) {
          // Already logged inside recordProgressEvent; swallow here so
          // we don't surface progress-save failures to the student.

          console.warn('Progress persist failed', e);
        }
      })();
      pendingSavesRef.current.push(save);
    },
    [lesson]
  );

  // Mark step arrivals in the AI log, so the log dialog can group the
  // calls by the step the student was on.
  useEffect(() => {
    if (progressLoading) return;
    const arrived = lessonRef.current.steps[currentIndex];
    if (arrived) recordStepMarker(arrived.title);
  }, [currentIndex, progressLoading]);

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
    // Static steps (questions, panels) carry their own authored content;
    // an AI opening there is pure latency and cost. Show nothing — the
    // tutor still responds if the student starts a chat.
    const kind = lessonRef.current.steps[currentIndex]?.kind;
    if (kind === 'questions' || kind === 'panels') {
      setBusy(false);
      return;
    }
    setBusy(true);
    (async () => {
      try {
        const reply = await generateTutorOpening(tutorContext());
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
    // Keyed on the step position, not the lesson object: an overlay
    // merge changes the lesson's identity mid-step and must not refire
    // the opening for the step the student is on.
  }, [currentIndex, progressLoading, tutorContext]);

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

  // End of the lesson: celebrate, and persist the durable completed
  // marker (the lesson list's status badge reads it — step counts can't
  // stand in for it because generated steps change the denominator).
  const finishLesson = useCallback(() => {
    setPhase('celebrate');
    if (lessonRef.current.id) {
      pendingSavesRef.current.push(
        saveSnapshotExtras(lessonRef.current.id, progressRef.current, {
          completed: true,
        }).then(saved => {
          if (saved) progressRef.current = saved;
        })
      );
    }
  }, []);

  // Apply a resolver decision to the UI.
  const navigateTo = useCallback(
    (decision: NavDecision) => {
      if (decision.kind === 'end') {
        finishLesson();
        return;
      }
      setCurrentStepId(decision.stepId);
      setPath(p => [...p, decision.stepId]);
    },
    [finishLesson]
  );

  // Persist a non-completing navigation (entering a path, returning to
  // the hub) so a reload resumes there rather than at the last event.
  const persistPosition = useCallback(
    (stepId: string) => {
      if (!lesson.id) return;
      saveSnapshotExtras(lesson.id, progressRef.current, {
        currentStepId: stepId,
      }).then(saved => {
        if (saved) progressRef.current = saved;
      });
    },
    [lesson.id]
  );

  // Run the arc generator and splice the result into this student's
  // overlay.  Returns the arc's entry step id, or undefined on failure
  // (callers fall through to the authored span).  REPLACES the whole
  // overlay — regeneration deliberately discards prior arc content and
  // any remediation attached to it.
  const runArcGeneration = useCallback(async (): Promise<
    string | undefined
  > => {
    const spec = authoredLesson.arcSpec;
    if (!authoredLesson.id || !spec) return undefined;
    setGeneratingArc(true);
    try {
      const arcSteps = await generateLessonArc({
        lesson: authoredLesson,
        inputs: inputsRef.current,
      });
      if (arcSteps.length === 0) return undefined;
      const updated: LessonOverlay = {
        steps: arcSteps,
        pathExtensions: {},
        rounds: {},
        nextOverrides: {[spec.generateAfter]: arcSteps[0].id},
      };
      await saveOverlay(authoredLesson.id, updated);
      setOverlay(updated);
      return arcSteps[0].id;
    } catch (e) {
      console.warn('Arc generation failed', e);
      return undefined;
    } finally {
      setGeneratingArc(false);
    }
  }, [authoredLesson]);

  // Enter a hub path: jump to its first incomplete step (or replay from
  // the top when it's already done).  Navigation, not completion —
  // nothing is recorded until steps complete.
  const enterPath = useCallback(
    (skillPath: SkillPath) => {
      const ids = pathStepsFor(lesson, skillPath);
      const target =
        ids.find(id => !completedRef.current.includes(id)) || ids[0];
      if (!target) return;
      navigateTo({kind: 'goto', stepId: target});
      persistPosition(target);
    },
    [lesson, navigateTo, persistPosition]
  );

  // The hub owning the current step, when it's a skill-path step.
  // Drives the "back to hub" affordance.
  const owningHub = hubOwning(lesson, currentStepId);

  // Whether completing this step ends the lesson, per the deterministic
  // preview.  Array position alone is wrong here: overlay steps are
  // appended to the array's end but route back to their hub.
  const endsLesson = !deterministicNextStep(lesson, currentStepId);

  const backToHub = useCallback(() => {
    if (!owningHub) return;
    navigateTo({kind: 'goto', stepId: owningHub.hub.id});
    persistPosition(owningHub.hub.id);
  }, [owningHub, navigateTo, persistPosition]);

  // Complete the current step: record it, ask the resolver where to go,
  // and navigate.  `selectedOptionId` is set when completion came from a
  // multiple-choice selection whose option may carry a branch target.
  // Used by every completion source — the post-verdict Continue button,
  // unvalidated steps' Continue, panels, and the questions placeholder.
  const completeStep = useCallback(
    async (selectedOptionId?: string) => {
      setPendingAdvance(null);
      // Mark the step complete before resolving: path continuation needs
      // the current step in the completed set to find the next one.
      if (!completedRef.current.includes(step.id)) {
        completedRef.current = [...completedRef.current, step.id];
        setCompletedStepIds(completedRef.current);
      }

      // The generation boundary: in full adaptivity, completing
      // arcSpec.generateAfter with no arc yet designs one now (the
      // generation screen shows meanwhile) and navigates into it.
      // Failure falls through to normal resolution — the authored span
      // is the fallback, not a special case.
      const spec = authoredLesson.arcSpec;
      if (
        adaptivityMode === 'full' &&
        spec &&
        step.id === spec.generateAfter &&
        !overlayRef.current.nextOverrides?.[spec.generateAfter]
      ) {
        const entryId = await runArcGeneration();
        if (entryId) {
          persistProgressEvent('checkpoint-completed', currentIndex, liveWork, {
            path: [...path, entryId],
            currentStepId: entryId,
          });
          navigateTo({kind: 'goto', stepId: entryId});
          return;
        }
      }

      setResolving(true);
      let decision: NavDecision;
      try {
        decision = await deterministicResolver.resolveNext({
          lesson,
          currentStepId: step.id,
          path,
          selectedOptionId,
          inputs: inputsRef.current,
          completedStepIds: completedRef.current,
          judgeCondition: judgeBranchCondition,
        });
      } finally {
        setResolving(false);
      }
      const destinationId =
        decision.kind === 'goto' ? decision.stepId : undefined;
      persistProgressEvent('checkpoint-completed', currentIndex, liveWork, {
        path: destinationId ? [...path, destinationId] : path,
        currentStepId: destinationId ?? step.id,
        branchOptionId: selectedOptionId,
        // The completed flag must ride THIS write: it's slow (LLM
        // summary) and unawaited, so finishLesson's separate quick write
        // races it and would be clobbered by this one's stale snapshot.
        completed: decision.kind === 'end' ? true : undefined,
      });

      // Rubric steps get a process observation on completion.  Fire and
      // forget: the LLM call takes seconds and must not block
      // navigation; the result merges into the snapshot when it lands.
      if (step.kind === 'lab' && step.rubric && lesson.id) {
        const lessonId = lesson.id;
        const completedStep = step;
        const workAtCompletion = liveWork;
        generateStepObservation({
          lesson,
          step: completedStep,
          inputs: inputsRef.current,
          work: workAtCompletion,
        })
          .then(async observation => {
            observationsRef.current = {
              ...observationsRef.current,
              [completedStep.id]: observation,
            };
            const saved = await saveSnapshotExtras(
              lessonId,
              progressRef.current,
              {observations: observationsRef.current}
            );
            if (saved) progressRef.current = saved;
          })
          .catch(e => console.warn('Step observation failed', e));
      }

      // Completing a hub path's last step triggers a background mastery
      // evaluation against the path's objective/standard.  Fire and
      // forget — the student is already back at the hub.  A mastered
      // verdict is final; a failed one regenerates targeted practice
      // (extending the path through the overlay) until the rounds cap,
      // after which the honest verdict stands.  Completing the added
      // practice re-completes the path, which re-enters right here.
      const owner = hubOwning(lesson, step.id);
      const priorVerdict = owner
        ? progressRef.current?.mastery?.[owner.path.id]
        : undefined;
      if (
        adaptivityMode !== 'static' &&
        owner &&
        lesson.id &&
        !priorVerdict?.mastered &&
        pathStepsFor(lesson, owner.path).every(id =>
          completedRef.current.includes(id)
        )
      ) {
        const lessonId = lesson.id;
        const masteredPath = owner.path;
        (async () => {
          const verdict = await evaluatePathMastery({
            lesson,
            path: masteredPath,
            inputs: inputsRef.current,
            observations: observationsRef.current,
            work: liveWork,
          });
          // The overlay write lands BEFORE the verdict write: a crash
          // between them leaves an extra exercise without a verdict
          // (harmless) rather than a "needs more" verdict whose
          // remediation never appeared.
          if (!verdict.mastered) {
            const roundsUsed = overlayRef.current.rounds[masteredPath.id] || 0;
            if (roundsUsed < MAX_REMEDIATION_ROUNDS) {
              try {
                const newSteps = await generateRemediationSteps({
                  lesson,
                  path: masteredPath,
                  verdict,
                  inputs: inputsRef.current,
                  round: roundsUsed + 1,
                });
                if (newSteps.length > 0) {
                  const current = overlayRef.current;
                  const updated: LessonOverlay = {
                    ...current,
                    steps: [...current.steps, ...newSteps],
                    pathExtensions: {
                      ...current.pathExtensions,
                      [masteredPath.id]: [
                        ...(current.pathExtensions[masteredPath.id] || []),
                        ...newSteps.map(s => s.id),
                      ],
                    },
                    rounds: {
                      ...current.rounds,
                      [masteredPath.id]: roundsUsed + 1,
                    },
                  };
                  await saveOverlay(lessonId, updated);
                  setOverlay(updated);
                }
              } catch (e) {
                // Generation failing must not lose the verdict; the
                // round is not consumed, so a later re-completion can
                // try again.
                console.warn('Remediation generation failed', e);
              }
            }
          }
          const saved = await saveSnapshotExtras(
            lessonId,
            progressRef.current,
            {
              mastery: {
                ...progressRef.current?.mastery,
                [masteredPath.id]: verdict,
              },
            }
          );
          if (saved) progressRef.current = saved;
        })().catch(e => console.warn('Mastery evaluation failed', e));
      }

      navigateTo(decision);
    },
    [
      lesson,
      authoredLesson.arcSpec,
      step,
      path,
      currentIndex,
      liveWork,
      adaptivityMode,
      runArcGeneration,
      persistProgressEvent,
      navigateTo,
    ]
  );

  const requestTutorTurn = useCallback(
    async (
      nextHistory: TutorMessage[],
      // `work` overrides the live redux snapshot — used to evaluate an
      // AI build result before the lab has remounted on it.
      options: {evaluating?: boolean; work?: string} = {}
    ) => {
      setHistory(nextHistory);
      setBusy(true);
      setEvaluating(!!options.evaluating);
      setError(undefined);
      try {
        const reply = await generateTutorReply(
          tutorContext(),
          nextHistory,
          options.work ?? liveWork
        );
        setHistory(h => [...h, {role: 'tutor' as const, text: reply.message}]);
        // Merge any per-item checklist verdicts the tutor returned.
        if (reply.checklist && reply.checklist.length > 0) {
          const merged = {...checklistRef.current};
          reply.checklist.forEach(v => {
            merged[v.id] = v.done;
          });
          checklistRef.current = merged;
          setChecklistState(merged);
        }
        handleAdvance(reply.action);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
        setEvaluating(false);
      }
    },
    [tutorContext, liveWork, handleAdvance]
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
  // log the run — unless the project checklist applies, in which case
  // the tutor still evaluates (it can't gate advancement here, but its
  // verdicts keep the checklist live).
  const handleLabRun = useCallback(() => {
    if (busy || phase !== 'in-progress') return;
    if (
      step.kind === 'lab' &&
      step.validation === 'none' &&
      !stepShowsChecklist(lesson, step)
    ) {
      persistProgressEvent('run', currentIndex, liveWork);
      return;
    }
    handleCheck();
  }, [
    busy,
    phase,
    step,
    lesson,
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
          <Link
            href="/ai_lessons"
            onClick={e => {
              // Plain clicks wait for in-flight snapshot writes (the
              // final event persist runs an LLM summary) so the lesson
              // list reads the completed status, not the old one.
              // Modifier/middle clicks keep native new-tab behavior.
              if (
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey ||
                e.altKey ||
                e.button !== 0
              ) {
                return;
              }
              e.preventDefault();
              if (leavingCelebrate) return;
              setLeavingCelebrate(true);
              Promise.allSettled(pendingSavesRef.current).then(() =>
                navigate('/ai_lessons')
              );
            }}
          >
            {leavingCelebrate ? 'Saving your progress…' : 'Back to lessons'}
          </Link>
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
          <div className={styles.lessonTitleRow}>
            <div className={styles.lessonTitle}>{lesson.title}</div>
            <div className={styles.headerIconRow}>
              <WithTooltip
                tooltipProps={{
                  text: 'Controls',
                  tooltipId: 'tt-controls-gear',
                  size: 'xs',
                  direction: 'onBottom',
                }}
              >
                <button
                  type="button"
                  className={styles.demoNavArrow}
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Open controls"
                  aria-describedby="tt-controls-gear"
                >
                  <FontAwesomeV6Icon iconName="gear" iconStyle="solid" />
                </button>
              </WithTooltip>
              <WithTooltip
                tooltipProps={{
                  text: 'AI Log — see what goes to and from the AI',
                  tooltipId: 'tt-ai-log',
                  size: 'xs',
                  direction: 'onBottom',
                }}
              >
                <button
                  type="button"
                  className={styles.demoNavArrow}
                  onClick={() => setAiLogOpen(true)}
                  aria-label="Open the AI Log"
                  aria-describedby="tt-ai-log"
                >
                  <FontAwesomeV6Icon iconFamily="kit" iconName="ai-bot-solid" />
                </button>
              </WithTooltip>
            </div>
          </div>
          <div className={styles.checkpointMeta}>
            <span>
              {generatingArc ? 'Designing your learning path…' : step.title}
            </span>
            {adaptivityMode === 'full' && arcPresent && (
              <WithTooltip
                tooltipProps={{
                  text: 'Regenerate the personalized arc from the same diagnostics',
                  tooltipId: 'tt-regenerate-arc',
                  size: 'xs',
                  direction: 'onBottom',
                }}
              >
                <button
                  type="button"
                  className={styles.demoNavArrow}
                  onClick={async () => {
                    // Demo affordance: throw away this student's arc
                    // (and any remediation on it) and design a fresh one.
                    if (!window.confirm('Regenerate this personalized path?')) {
                      return;
                    }
                    const entryId = await runArcGeneration();
                    if (entryId) {
                      navigateTo({kind: 'goto', stepId: entryId});
                      persistPosition(entryId);
                    }
                  }}
                  disabled={generatingArc}
                  aria-label="Regenerate the personalized path"
                  aria-describedby="tt-regenerate-arc"
                >
                  <FontAwesomeV6Icon
                    iconName="arrows-rotate"
                    iconStyle="solid"
                  />
                </button>
              </WithTooltip>
            )}
          </div>
          {!generatingArc && owningHub && (
            <button
              type="button"
              className={styles.backToHub}
              onClick={backToHub}
              title="Return to the skill map — your progress here is kept"
            >
              <span>← {owningHub.hub.title}</span>
              {owningHub.hub.paths.map(p => {
                const {done, total} = pathProgress(lesson, p, completedStepIds);
                return (
                  <span
                    key={p.id}
                    className={
                      p.id === owningHub.path.id
                        ? styles.miniRingCurrent
                        : styles.miniRing
                    }
                    title={`${p.title}: ${done}/${total}`}
                  >
                    <ProgressRing done={done} total={total} size={20} />
                  </span>
                );
              })}
            </button>
          )}
        </header>

        {/* Pin the tutor's opening (welcome + instruction) at the top so
            it stays visible as the rest of the conversation grows.
            Rendered as instructional content (not a chat bubble) so the
            student reads it as the brief for this checkpoint. */}
        {!generatingArc && opening && (
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

        {/* While the arc generator runs, everything below the header
            belongs to the step the student just left — hide it and let
            the main-area generation screen carry the moment. */}
        {generatingArc && (
          <div className={styles.transcript}>
            <div className={styles.muted}>
              The tutor will meet you at your first new step…
            </div>
          </div>
        )}

        {!generatingArc && (
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
        )}

        {!generatingArc && stepShowsChecklist(lesson, step) && (
          <ChecklistPanel
            items={lesson.checklist || []}
            state={checklistState}
          />
        )}

        {!generatingArc &&
          step.kind === 'lab' &&
          step.aiPrompting &&
          step.aiPrompting !== 'off' && (
            <BuildPartnerPanel
              key={step.id}
              lesson={lesson}
              step={step}
              inputs={inputs}
              onRecordPrompt={handleAnswer}
              onSourcesApplied={() => setSourcesEpoch(e => e + 1)}
              onEvaluateWork={work =>
                requestTutorTurn(history, {evaluating: true, work})
              }
            />
          )}

        {!generatingArc && step.kind === 'lab' && (
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
                  // When the project checklist applies, offer an
                  // evaluation on demand too, since nothing gates here.
                  <>
                    {stepShowsChecklist(lesson, step) && (
                      <MuiButton
                        variant="outlined"
                        color="primary"
                        type="button"
                        size="small"
                        onClick={handleCheck}
                        disabled={busy || starterGenerating}
                      >
                        Check my work
                      </MuiButton>
                    )}
                    <MuiButton
                      variant="contained"
                      color="primary"
                      type="button"
                      size="small"
                      onClick={() => completeStep()}
                      disabled={busy || resolving || starterGenerating}
                      className={styles.continueButton}
                    >
                      {starterGenerating
                        ? 'Preparing your code…'
                        : resolving
                        ? "Deciding what's next…"
                        : endsLesson
                        ? 'Finish lesson →'
                        : 'Continue →'}
                    </MuiButton>
                  </>
                ) : pendingAdvance ? (
                  <MuiButton
                    variant="contained"
                    color="primary"
                    type="button"
                    size="small"
                    onClick={() => completeStep()}
                    disabled={busy || resolving || starterGenerating}
                    className={styles.continueButton}
                  >
                    <span className={styles.shimmerText}>
                      {starterGenerating
                        ? 'Preparing your code…'
                        : resolving
                        ? "Deciding what's next…"
                        : pendingAdvance === 'celebrate'
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
                    disabled={busy || starterGenerating}
                  >
                    Check my work
                  </MuiButton>
                ))}
            </UserMessageEditor>
          </div>
        )}
      </aside>

      {aiLogOpen && <AiLogDialog onClose={() => setAiLogOpen(false)} />}

      {settingsOpen && (
        <DemoSettingsDialog
          onClose={() => setSettingsOpen(false)}
          stepControl={{
            steps: lesson.steps.map(s => ({id: s.id, title: s.title})),
            currentIndex,
            canPrev: !(currentIndex === 0 && path.length <= 1),
            // Retrace the path when there is one, else fall back to the
            // previous array position.
            onPrev: () => {
              if (path.length > 1) {
                const previous = path[path.length - 2];
                setPath(p => p.slice(0, -1));
                setCurrentStepId(previous);
              } else if (currentIndex > 0) {
                setCurrentStepId(lesson.steps[currentIndex - 1].id);
              }
            },
            // Array order on purpose (ignores branch targets), so a
            // presenter can page through every step without getting
            // caught in a hub loop.
            onNext: () => {
              if (currentIndex < lesson.steps.length - 1) {
                const next = lesson.steps[currentIndex + 1].id;
                setCurrentStepId(next);
                setPath(p => [...p, next]);
              } else {
                finishLesson();
              }
            },
            onGoTo: stepId => {
              setCurrentStepId(stepId);
              setPath(p => [...p, stepId]);
            },
          }}
          adaptivityControl={{
            current: adaptivityMode,
            max:
              authoredLesson.adaptivity?.max ??
              authoredLesson.adaptivity?.default ??
              'augment',
            // A mode switch is a restart in different clothes: same
            // wipe, then reload at the new ?adaptivity= URL.
            onSwitch: async mode => {
              if (!lesson.id) return;
              try {
                await resetLessonProgress(lesson.id);
              } catch (e) {
                setError(`Could not reset: ${(e as Error).message}`);
                return;
              }
              const url = new URL(window.location.href);
              url.searchParams.set('adaptivity', mode);
              window.location.href = url.toString();
            },
          }}
          onRestart={async () => {
            // Server-side wipe (progress, inputs, sources, overlays for
            // this lesson), then a hard reload: StudentPage keeps too
            // much in refs to restart cleanly in place, and the reload
            // preserves the URL (including ?adaptivity=).
            if (!lesson.id) return;
            try {
              await resetLessonProgress(lesson.id);
            } catch (e) {
              setError(`Could not reset: ${(e as Error).message}`);
              return;
            }
            window.location.reload();
          }}
        />
      )}

      <main className={styles.labArea}>
        {generatingArc ? (
          <div className={styles.arcGenerating}>
            <div className={styles.arcGeneratingTitle}>
              Designing your learning path…
            </div>
            <p>Building a plan around what you showed us, aimed at:</p>
            <div className={styles.lessonStandards}>
              <strong>Standards</strong>
              <ul>
                {(authoredLesson.arcSpec?.standards || []).map(s => {
                  // arcSpec standard text uses the same "ID: text" shape
                  // the lesson list splits server-side.
                  const colon = s.text.indexOf(':');
                  const id = colon > 0 ? s.text.slice(0, colon) : undefined;
                  const rest =
                    colon > 0 ? s.text.slice(colon + 1).trim() : s.text;
                  return (
                    <li key={s.id}>
                      <span className={styles.standardCheck} aria-hidden>
                        ✓
                      </span>
                      <span>
                        {id && <strong>{id}: </strong>}
                        {rest}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className={styles.muted}>This can take a minute.</p>
          </div>
        ) : step.kind === 'hub' ? (
          <SkillHub
            key={`${lesson.id || 'unsaved'}-${step.id}`}
            lesson={lesson}
            hub={step}
            completedStepIds={completedStepIds}
            onEnterPath={enterPath}
            onContinue={() => completeStep()}
          />
        ) : step.kind === 'questions' ? (
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
            judgeAnswer={(question, answer) =>
              judgeFreeResponse(tutorContext(), question, answer)
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
            onGeneratingChange={setStarterGenerating}
          />
        )}
      </main>
    </div>
  );
};

export default StudentPage;
