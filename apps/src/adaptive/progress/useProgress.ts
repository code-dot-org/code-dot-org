// Progress as the views use it: the hook that loads a student's progress,
// applies each change at once and sends it on, and the labels the map shows
// for each status.

import {useCallback, useEffect, useMemo, useState} from 'react';

import {TestResults} from '@cdo/apps/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {Pathway, Step} from '../types';

import {
  Answer,
  CheckpointStatus,
  EMPTY_PROGRESS,
  PROJECT_STEP_ID,
  Progress,
  StepContext,
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
  const send = useCallback(
    (step: Step, write: StepWrite, levelResult: number) => {
      if (step.kind !== 'level') {
        store.saveStep({scriptId, levelId}, step.id, write);
        return;
      }
      const stepLevelId = step.levelProperties?.id;
      if (stepLevelId === undefined || !reportLevelStep) return;
      reportLevelStep(
        stepLevelId,
        levelResult,
        write.timeSinceLastSave ?? 0
      ).catch(error => logFailure(`report ${step.id}`, error));
    },
    [store, scriptId, levelId, reportLevelStep]
  );

  const startStep = useCallback(
    (step: Step) => {
      if (step.id === PROJECT_STEP_ID) return;
      updateStep(step.id, entry => ({
        timeSpent: 0,
        ...entry,
        status: entry?.status ?? 'started',
      }));
      send(step, {started: true}, TestResults.LEVEL_STARTED);
    },
    [updateStep, send]
  );

  const completeStep = useCallback(
    (step: Step, timeMs: number) => {
      if (step.id === PROJECT_STEP_ID) return;
      updateStep(step.id, entry => ({
        ...entry,
        status: 'complete',
        timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
      }));
      send(
        step,
        {completed: true, timeSinceLastSave: timeMs},
        TestResults.FREE_PLAY
      );
    },
    [updateStep, send]
  );

  /** Records the time on a step the student leaves without finishing it. */
  const leaveStep = useCallback(
    (step: Step, timeMs: number) => {
      if (step.id === PROJECT_STEP_ID) return;
      updateStep(step.id, entry => ({
        ...entry,
        status: entry?.status ?? 'started',
        timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
      }));
      send(step, {timeSinceLastSave: timeMs}, TestResults.LEVEL_STARTED);
    },
    [updateStep, send]
  );

  const saveAnswers = useCallback(
    (step: Step, questionId: number, answers: Answer[], timeMs: number) => {
      updateStep(step.id, entry => ({
        ...entry,
        status: entry?.status ?? 'started',
        submitted: true,
        timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
        answers: {...entry?.answers, [questionId]: answers},
      }));
      store.saveStep({scriptId, levelId}, step.id, {
        answers: {questionId, list: answers},
        timeSinceLastSave: timeMs,
      });
    },
    [updateStep, store, scriptId, levelId]
  );

  const updateStepContext = useCallback(
    (id: string, patch: Pick<StepContext, 'generated'>) => {
      const content = patch.generated;
      if (!content) return;
      updateStep(id, entry => ({
        timeSpent: 0,
        ...entry,
        generatedInstructions: content,
      }));
      store.saveStep({scriptId, levelId}, id, {generatedInstructions: content});
    },
    [updateStep, store, scriptId, levelId]
  );

  const stepContextMap = useMemo(() => {
    const map: {[stepId: string]: StepContext} = {};
    for (const [id, entry] of Object.entries(progress?.steps ?? {})) {
      map[id] = {
        answers: entry.answers,
        generated: entry.generatedInstructions,
      };
    }
    return map;
  }, [progress]);

  const reset = useCallback(() => {
    setProgress(EMPTY_PROGRESS);
    store.reset({scriptId, levelId});
  }, [store, scriptId, levelId]);

  return {
    progress,
    isLoading: progress === undefined,
    statusMap,
    stepContextMap,
    startStep,
    completeStep,
    leaveStep,
    saveAnswers,
    updateStepContext,
    reset,
  };
}
