// Checkpoint progress. Held in component state for now; per-user
// persistence arrives once the progress shape is more finalized.

import {useCallback, useMemo, useState} from 'react';

import {Checkpoint, Pathway} from '../types';

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

export function useProgress(pathway: Pathway) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const statusMap = useMemo(
    () => getStatusMap(pathway, progress),
    [pathway, progress]
  );

  const markStarted = useCallback((id: string) => {
    setProgress(p =>
      p.started.includes(id) ? p : {...p, started: [...p.started, id]}
    );
  }, []);

  const markComplete = useCallback((id: string) => {
    setProgress(p =>
      p.completed.includes(id) ? p : {...p, completed: [...p.completed, id]}
    );
  }, []);

  const reset = useCallback(() => setProgress(EMPTY_PROGRESS), []);

  return {progress, statusMap, markStarted, markComplete, reset};
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
