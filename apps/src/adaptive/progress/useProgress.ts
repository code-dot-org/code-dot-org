// Progress as the views use it: the hook that loads, updates and saves a
// student's progress, and the labels the map shows for each status.

import {useCallback, useEffect, useMemo, useState} from 'react';

import {Pathway} from '../types';

import {
  Answer,
  CheckpointStatus,
  EMPTY_PROGRESS,
  GeneratedContent,
  Progress,
  StepContext,
  getStatusMap,
} from './model';
import {
  ProgressKey,
  ProgressStore,
  localStorageProgressStore,
} from './progressStore';

export const STATUS_LABELS: {[status in CheckpointStatus]: string} = {
  locked: 'Locked',
  available: 'Ready to start',
  inProgress: 'In progress',
  complete: 'Complete',
};

export function useProgress(
  pathway: Pathway,
  key: ProgressKey,
  store: ProgressStore = localStorageProgressStore
) {
  // Undefined until the stored progress has been loaded.
  const [progress, setProgress] = useState<Progress>();
  // Destructure key so its members can be used as primitive deps.
  const {userId, scriptId, levelId, pathwayId} = key;

  useEffect(() => {
    let cancelled = false;
    setProgress(undefined);
    store.load({userId, scriptId, levelId, pathwayId}).then(loaded => {
      if (!cancelled) setProgress(loaded ?? EMPTY_PROGRESS);
    });
    return () => {
      cancelled = true;
    };
  }, [store, userId, scriptId, levelId, pathwayId]);

  useEffect(() => {
    if (progress) store.save({userId, scriptId, levelId, pathwayId}, progress);
  }, [store, userId, scriptId, levelId, pathwayId, progress]);

  const statusMap = useMemo(
    () => getStatusMap(pathway, progress ?? EMPTY_PROGRESS),
    [pathway, progress]
  );

  const markStarted = useCallback((id: string) => {
    setProgress(p =>
      !p || p.started.includes(id) ? p : {...p, started: [...p.started, id]}
    );
  }, []);

  const markComplete = useCallback((id: string) => {
    setProgress(p =>
      !p || p.completed.includes(id)
        ? p
        : {...p, completed: [...p.completed, id]}
    );
  }, []);

  // Generated instructions live for the page only; they are not progress.
  const [generated, setGenerated] = useState<{
    [stepId: string]: GeneratedContent;
  }>({});

  const updateStepContext = useCallback(
    (id: string, patch: Pick<StepContext, 'generated'>) => {
      const content = patch.generated;
      if (content) setGenerated(g => ({...g, [id]: content}));
    },
    []
  );

  const stepContextMap = useMemo(() => {
    const map: {[stepId: string]: StepContext} = {};
    for (const [id, context] of Object.entries(progress?.stepContext ?? {})) {
      map[id] = {answers: context.answers};
    }
    for (const [id, content] of Object.entries(generated)) {
      map[id] = {...map[id], generated: content};
    }
    return map;
  }, [progress, generated]);

  const saveAnswers = useCallback(
    (stepId: string, questionId: number, answers: Answer[]) => {
      setProgress(p => {
        if (!p) return p;
        const step = p.stepContext[stepId];
        return {
          ...p,
          stepContext: {
            ...p.stepContext,
            [stepId]: {
              ...step,
              answers: {...step?.answers, [questionId]: answers},
            },
          },
        };
      });
    },
    []
  );

  const reset = useCallback(() => {
    setProgress(EMPTY_PROGRESS);
    setGenerated({});
  }, []);

  return {
    progress,
    isLoading: progress === undefined,
    statusMap,
    stepContextMap,
    markStarted,
    markComplete,
    updateStepContext,
    saveAnswers,
    reset,
  };
}
