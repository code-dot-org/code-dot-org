// Progress as the views use it: the hook that loads, updates and saves a
// student's progress, and the labels the map shows for each status.

import {useCallback, useEffect, useMemo, useState} from 'react';

import {Pathway} from '../types';

import {
  CheckpointStatus,
  EMPTY_PROGRESS,
  Progress,
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

const NO_ANSWERS: NonNullable<Progress['questionAnswers']> = {};

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

  const saveAnswer = useCallback(
    (stepId: string, questionId: number, choiceId: string) => {
      setProgress(p => {
        if (!p) return p;
        const step = {...p.questionAnswers?.[stepId], [questionId]: choiceId};
        return {...p, questionAnswers: {...p.questionAnswers, [stepId]: step}};
      });
    },
    []
  );

  const reset = useCallback(() => setProgress(EMPTY_PROGRESS), []);

  return {
    progress,
    isLoading: progress === undefined,
    statusMap,
    answers: progress?.questionAnswers ?? NO_ANSWERS,
    markStarted,
    markComplete,
    saveAnswer,
    reset,
  };
}
