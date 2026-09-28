// Checkpoint progress: which checkpoints a student has started and completed,
// and the status each checkpoint takes from that. Persisted through a
// ProgressStore so the shape can settle before a server-backed store exists.

import {useCallback, useEffect, useMemo, useState} from 'react';

import {Checkpoint, Pathway} from '../types';

import {
  ProgressKey,
  ProgressStore,
  localStorageProgressStore,
} from './progressStore';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete';

export const STATUS_LABELS: {[status in CheckpointStatus]: string} = {
  locked: 'Locked',
  available: 'Ready to start',
  inProgress: 'In progress',
  complete: 'Complete',
};

/** Each checkpoint's status, by checkpoint id. */
export type CheckpointStatusMap = {[checkpointId: string]: CheckpointStatus};

export interface Progress {
  completed: string[];
  started: string[];
}

export const EMPTY_PROGRESS: Progress = {completed: [], started: []};

export function useProgress(
  pathway: Pathway,
  key: ProgressKey,
  store: ProgressStore = localStorageProgressStore
) {
  // Undefined until the stored progress has been read. Nothing is written in
  // that state, so a slow load cannot be overwritten by an empty default.
  const [progress, setProgress] = useState<Progress>();
  // Primitive deps: a caller passing a fresh key object each render must not
  // re-run the load.
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

  const reset = useCallback(() => setProgress(EMPTY_PROGRESS), []);

  return {
    progress,
    isLoading: progress === undefined,
    statusMap,
    markStarted,
    markComplete,
    reset,
  };
}

/** A checkpoint unlocks once every checkpoint it requires is complete. */
export function checkpointStatus(
  checkpoint: Checkpoint,
  progress: Progress
): CheckpointStatus {
  if (progress.completed.includes(checkpoint.id)) return 'complete';
  const unlocked = (checkpoint.requires || []).every(r =>
    progress.completed.includes(r)
  );
  if (!unlocked) return 'locked';
  return progress.started.includes(checkpoint.id) ? 'inProgress' : 'available';
}

export function getStatusMap(
  pathway: Pathway,
  progress: Progress
): CheckpointStatusMap {
  return Object.fromEntries(
    pathway.checkpoints.map(c => [c.id, checkpointStatus(c, progress)])
  );
}
