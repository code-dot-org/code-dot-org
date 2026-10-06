// The progress model: which checkpoints a student has started and completed,
// and the status each checkpoint takes from that. Nothing here touches React
// or storage; useProgress and progressStore build on it.

import {hashString} from '../ai/hashString';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete';

/** Each checkpoint's status, by checkpoint id. */
export type CheckpointStatusMap = {[checkpointId: string]: CheckpointStatus};

/** What a step has accumulated for a student, by concern. */
export interface StepContext {
  /** Any content that was dynamically generated for this step, keyed by generateInputsHash. */
  generated?: {instructions: string; inputsHash: string};
}

/** Keys generated instructions to what they were made from. */
export function generateInputsHash(
  step: LevelStep,
  projectInfo: PathwayProjectInfo,
  sourceCode: string
): string {
  return hashString(
    [
      step.instructionsPrompt,
      projectInfo.name,
      projectInfo.description,
      sourceCode,
    ]
      .map(s => s ?? '')
      .join('\u0000')
  );
}

export interface Progress {
  completed: string[];
  started: string[];
  stepContext: {[stepId: string]: StepContext};
}

export const EMPTY_PROGRESS: Progress = {
  completed: [],
  started: [],
  stepContext: {},
};

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
