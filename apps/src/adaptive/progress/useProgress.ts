// Progress as the views use it: the hook that loads a student's progress,
// applies each change at once and sends it on, and the labels the map shows
// for each status.

import {useCallback, useEffect, useMemo, useState} from 'react';

import {TestResults} from '@cdo/apps/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {routeAfterCompletion} from '../routing/routeAfterCompletion';
import {Checkpoint, Pathway, Step} from '../types';

import {
  Answer,
  CheckpointStatus,
  EMPTY_PROGRESS,
  GeneratedContent,
  PROJECT_STEP_ID,
  Progress,
  StepProgress,
  getStatusMap,
} from './model';
import {
  ProgressKey,
  ProgressStore,
  StepWrite,
  serverProgressStore,
} from './progressStore';

export const STATUS_LABELS: {[status in CheckpointStatus]: string} = {
  locked: 'Locked',
  available: 'Ready to start',
  inProgress: 'In progress',
  complete: 'Complete',
};

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
}

// The server rounds each save up to whole seconds; match it.
const toSeconds = (ms: number) => Math.ceil(ms / 1000);

const logFailure = (what: string, error: unknown) =>
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .logError(`Adaptive progress: ${what} failed`, error as Error);

export function useProgress(
  pathway: Pathway,
  key: ProgressKey,
  {store = serverProgressStore, reportLevelStep}: ProgressOptions = {}
) {
  // Undefined until the stored progress has been loaded.
  const [progress, setProgress] = useState<Progress>();
  // Destructure key so its members can be used as primitive deps.
  const {scriptId, levelId} = key;

  useEffect(() => {
    let cancelled = false;
    setProgress(undefined);
    store.load({scriptId, levelId}).then(
      loaded => {
        if (!cancelled) setProgress(loaded);
      },
      error => {
        logFailure('load', error);
        if (!cancelled) setProgress(EMPTY_PROGRESS);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [store, scriptId, levelId]);

  const statusMap = useMemo(
    () => getStatusMap(pathway, progress ?? EMPTY_PROGRESS),
    [pathway, progress]
  );

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
      ).catch(error => logFailure(`report ${step.id}`, error));
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

  const completeStep = useCallback(
    (step: Step, timeMs: number) => {
      if (step.id === PROJECT_STEP_ID) return;
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
    [reportStepProgress]
  );

  /** Records the time on a step the student leaves without finishing it. */
  const leaveStep = useCallback(
    (step: Step, timeMs: number) => {
      if (step.id === PROJECT_STEP_ID) return;
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

  // A functional update, so the router sees the step completion and answers
  // saved by the same click.
  const finishCheckpoint = useCallback(
    (checkpoint: Checkpoint) =>
      setProgress(p => p && routeAfterCompletion(pathway, p, checkpoint)),
    [pathway]
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

  return {
    progress,
    isLoading: progress === undefined,
    statusMap,
    startStep,
    completeStep,
    leaveStep,
    saveAnswers,
    saveGeneratedInstructions,
    finishCheckpoint,
  };
}
