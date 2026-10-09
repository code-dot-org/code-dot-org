// The progress model: which checkpoints a student has started and completed,
// and the status each checkpoint takes from that. Nothing here touches React
// or storage; useProgress and progressStore build on it.

import {hashString} from '@cdo/apps/utils';

import {Checkpoint, Pathway} from '../types';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete';

/** Each checkpoint's status, by checkpoint id. */
export type CheckpointStatusMap = {[checkpointId: string]: CheckpointStatus};

/** One submitted answer. isCorrect is absent for a survey question. */
export interface Answer {
  answerId: string;
  isCorrect?: boolean;
}

/** Submitted answers per question, oldest first; the last is current. */
export type StepAnswers = {[questionId: number]: Answer[]};

/** Content generated for a step, keyed by generateInputsHash. */
export interface GeneratedContent {
  instructions: string;
  inputsHash: string;
}

/** What a step has accumulated for a student, by concern. */
export interface StepContext {
  generated?: GeneratedContent;
  answers?: StepAnswers;
}

/**
 * Keys generated content to the full prompt it was made from, so a change
 * to any input, the brief, the project, the authored text or our wording,
 * regenerates it.
 */
export function generateInputsHash(prompt: string): string {
  return hashString(prompt);
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
