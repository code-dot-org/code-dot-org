// Progress as the views use it: the hook that loads a student's progress,
// applies each change at once and sends it on.

import {useCallback, useEffect, useState} from 'react';

import {TestResults} from '@cdo/apps/constants';

import {Pathway, Step} from '../types';

import {
  Answer,
  EMPTY_PROGRESS,
  GeneratedContent,
  PROJECT_STEP_ID,
  Progress,
  StepProgress,
  ValidationAttempt,
} from './model';
import {
  ProgressKey,
  ProgressStore,
  StepWrite,
  recordProgressFailure,
  recordProgressOk,
  serverProgressStore,
} from './progressStore';
import {usePathwayStatus} from './usePathwayStatus';

/** Records a result on a level step's level; see sendAdaptiveStepReport. */
export type LevelStepReporter = (
  levelId: number,
  appType: string,
  result: number,
  timeMs: number
) => Promise<void>;

interface ProgressOptions {
  store?: ProgressStore;
  reportLevelStep?: LevelStepReporter;
  /**
   * A student whose progress a teacher is viewing.
   * No progress is saved when this is set.
   */
  viewAsUserId?: number | null;
}

// The server rounds each save up to whole seconds; match it.
const toSeconds = (ms: number) => Math.ceil(ms / 1000);

// Stands in for each write while the pathway is read-only; one function, so
// callers that depend on it do not rerun on every render.
const ignore = () => {};

export function useProgress(
  pathway: Pathway,
  key: ProgressKey,
  {
    store = serverProgressStore,
    reportLevelStep,
    viewAsUserId = null,
  }: ProgressOptions = {}
) {
  // Undefined until the stored progress has been loaded.
  const [progress, setProgress] = useState<Progress>();
  // Destructure key so its members can be used as primitive deps.
  const {scriptId, levelId} = key;
  const isViewingStudent = viewAsUserId !== null;
  // Nothing the viewer does is saved or generated. Today only a teacher
  // viewing a student reads a pathway they may not change.
  const isReadonly = isViewingStudent;

  useEffect(() => {
    let cancelled = false;
    setProgress(undefined);
    store.load({scriptId, levelId}, viewAsUserId ?? undefined).then(
      loaded => {
        recordProgressOk('load');
        if (!cancelled) setProgress(loaded);
      },
      error => {
        recordProgressFailure('load', error);
        if (!cancelled) setProgress(EMPTY_PROGRESS);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [store, scriptId, levelId, viewAsUserId]);

  const {evidence, statusMap} = usePathwayStatus(pathway, progress);

  const updateStep = useCallback(
    (stepId: string, change: (entry?: StepProgress) => StepProgress) =>
      setProgress(
        p => p && {...p, steps: {...p.steps, [stepId]: change(p.steps[stepId])}}
      ),
    []
  );

  // A level step's progress is its level's own, so it goes to a milestone.
  const reportStepProgress = useCallback(
    (
      step: Step,
      change: (entry?: StepProgress) => StepProgress,
      write: StepWrite
    ) => {
      updateStep(step.id, change);
      if (step.kind !== 'level') {
        store.saveStep({scriptId, levelId}, step.id, write);
        return;
      }
      const properties = step.levelProperties;
      if (!properties || !reportLevelStep) return;
      reportLevelStep(
        properties.id,
        properties.appName,
        write.completed ? TestResults.ALL_PASS : TestResults.LEVEL_STARTED,
        write.timeSinceLastSave ?? 0
      ).then(
        () => recordProgressOk('level_step'),
        error => recordProgressFailure('level_step', error, step.id)
      );
    },
    [updateStep, store, scriptId, levelId, reportLevelStep]
  );

  const startStep = useCallback(
    (step: Step) => {
      if (step.id === PROJECT_STEP_ID) return;
      reportStepProgress(
        step,
        entry => ({
          timeSpent: 0,
          ...entry,
          status: entry?.status ?? 'started',
        }),
        {started: true}
      );
    },
    [reportStepProgress]
  );

  /**
   * Records the time on a step the student leaves without finishing it. The
   * project screen's time goes to the template level this way, and is never
   * more than time: the screen is not a step the student completes.
   */
  const leaveStep = useCallback(
    (step: Step, timeMs: number) => {
      reportStepProgress(
        step,
        entry => ({
          ...entry,
          status: entry?.status ?? 'started',
          timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
        }),
        {timeSinceLastSave: timeMs}
      );
    },
    [reportStepProgress]
  );

  const completeStep = useCallback(
    (step: Step, timeMs: number) => {
      if (step.id === PROJECT_STEP_ID) return leaveStep(step, timeMs);
      reportStepProgress(
        step,
        entry => ({
          ...entry,
          status: 'complete',
          timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
        }),
        {completed: true, timeSinceLastSave: timeMs}
      );
    },
    [reportStepProgress, leaveStep]
  );

  const saveAnswers = useCallback(
    (step: Step, questionId: number, answers: Answer[], timeMs: number) =>
      reportStepProgress(
        step,
        entry => ({
          ...entry,
          status: entry?.status ?? 'started',
          submitted: true,
          timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
          answers: {...entry?.answers, [questionId]: answers},
        }),
        {answers: {questionId, list: answers}, timeSinceLastSave: timeMs}
      ),
    [reportStepProgress]
  );

  const saveGeneratedInstructions = useCallback(
    (id: string, content: GeneratedContent) => {
      updateStep(id, entry => ({
        timeSpent: 0,
        ...entry,
        generatedInstructions: content,
      }));
      store.saveInstructions({scriptId, levelId}, id, content);
    },
    [updateStep, store, scriptId, levelId]
  );

  /** Appends a check of a project step's work, dated now until the server's time arrives with the next load. */
  const recordValidation = useCallback(
    (step: Step, attempt: Omit<ValidationAttempt, 'at'>) => {
      const dated = {...attempt, at: new Date().toISOString()};
      updateStep(step.id, entry => ({
        timeSpent: 0,
        ...entry,
        validationHistory: [...(entry?.validationHistory ?? []), dated],
      }));
      store.saveValidation({scriptId, levelId}, step.id, attempt);
    },
    [updateStep, store, scriptId, levelId]
  );

  return {
    progress,
    isLoading: progress === undefined,
    isViewingStudent,
    isReadonly,
    viewAsUserId,
    statusMap,
    /** What the student has shown in each skill, which the status map is routed on. */
    evidence,
    // A read-only viewer's clicks are not progress, on the page or on the
    // server: every function that writes progress belongs here.
    startStep: isReadonly ? ignore : startStep,
    completeStep: isReadonly ? ignore : completeStep,
    leaveStep: isReadonly ? ignore : leaveStep,
    saveAnswers: isReadonly ? ignore : saveAnswers,
    saveGeneratedInstructions: isReadonly ? ignore : saveGeneratedInstructions,
    recordValidation: isReadonly ? ignore : recordValidation,
  };
}
