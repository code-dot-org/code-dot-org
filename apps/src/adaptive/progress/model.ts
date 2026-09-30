// The progress model: which checkpoints a student has started and completed,
// and the status each checkpoint takes from that. Nothing here touches React
// or storage; useProgress and progressStore build on it.

import {Checkpoint, Pathway} from '../types';

import type {StudentInputs} from './answers';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete';

/** Each checkpoint's status, by checkpoint id. */
export type CheckpointStatusMap = {[checkpointId: string]: CheckpointStatus};

export interface Progress {
  completed: string[];
  started: string[];
  /** Absent in records saved before questions steps existed. */
  inputs?: StudentInputs;
}

export const EMPTY_PROGRESS: Progress = {completed: [], started: []};

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
