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
  GeneratedContent,
  PROJECT_STEP_ID,
  Progress,
  StepContext,
  StepProgress,
  getStatusMap,
} from './model';
import {
  LocalGeneratedInstructionsStore,
  GeneratedInstructions,
  ProgressKey,
  ProgressStore,
  StepWrite,
  localGeneratedInstructionsStore,
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
  generatedStore?: LocalGeneratedInstructionsStore;
  /** Keys the local record; the server takes the user from the session. */
  userId?: number | null;
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
  {
    store = serverProgressStore,
    generatedStore = localGeneratedInstructionsStore,
    userId = null,
    reportLevelStep,
  }: ProgressOptions = {}
) {
  // Undefined until the stored progress has been loaded.
  const [progress, setProgress] = useState<Progress>();
  // Generated instructions, kept locally until the server stores them.
  const [generated, setGenerated] = useState<GeneratedInstructions>();
  // Destructure key so its members can be used as primitive deps.
  const {scriptId, levelId} = key;
  const pathwayId = pathway.id;

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

  useEffect(() => {
    let cancelled = false;
    setGenerated(undefined);
    generatedStore.load({userId, scriptId, levelId, pathwayId}).then(loaded => {
      if (!cancelled) setGenerated(loaded ?? {});
    });
    return () => {
      cancelled = true;
    };
  }, [generatedStore, userId, scriptId, levelId, pathwayId]);

  useEffect(() => {
    if (generated) {
      generatedStore.save({userId, scriptId, levelId, pathwayId}, generated);
    }
  }, [generatedStore, userId, scriptId, levelId, pathwayId, generated]);

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
      updateStep(step.id, entry => entry ?? {status: 'started', timeSpent: 0});
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
        status: 'started',
        ...entry,
        timeSpent: (entry?.timeSpent ?? 0) + toSeconds(timeMs),
      }));
      send(step, {timeSinceLastSave: timeMs}, TestResults.LEVEL_STARTED);
    },
    [updateStep, send]
  );

  const saveAnswers = useCallback(
    (step: Step, questionId: number, answers: Answer[], timeMs: number) => {
      updateStep(step.id, entry => ({
        status: 'started',
        ...entry,
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

  const saveGeneratedInstructions = useCallback(
    (id: string, content: GeneratedContent) =>
      setGenerated(g => g && {...g, [id]: content}),
    []
  );

  const stepContextMap = useMemo(() => {
    const map: {[stepId: string]: StepContext} = {};
    for (const [id, entry] of Object.entries(progress?.steps ?? {})) {
      if (entry.answers) map[id] = {answers: entry.answers};
    }
    for (const [id, content] of Object.entries(generated ?? {})) {
      map[id] = {...map[id], generated: content};
    }
    return map;
  }, [progress, generated]);

  return {
    progress,
    isLoading: progress === undefined,
    statusMap,
    stepContextMap,
    startStep,
    completeStep,
    leaveStep,
    saveAnswers,
    saveGeneratedInstructions,
  };
}
