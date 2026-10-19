// The progress model: each step's state for a student, and the status each
// checkpoint takes from its steps. Nothing here touches React or storage;
// useProgress and progressStore build on it.

import {hashString} from '@cdo/apps/utils';

import {Checkpoint, Pathway} from '../types';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete';

/** Each checkpoint's status, by checkpoint id. */
export type CheckpointStatusMap = {[checkpointId: string]: CheckpointStatus};

/** One submitted answer. isCorrect is absent for a survey question; text is set for free-response questions. */
export interface Answer {
  answerId: string;
  isCorrect?: boolean;
  text?: string;
}

/** Submitted answers per question, oldest first; the last is current. */
export type StepAnswers = {[questionId: number]: Answer[]};

/** Content generated for a step, keyed by generateInputsHash. */
export interface GeneratedContent {
  instructions: string;
  inputsHash: string;
  /** The Langfuse trace it was generated under. */
  traceId?: string;
}

/**
 * Keys generated content to the full prompt it was made from, so a change
 * to any input, the brief, the project, the authored text or our wording,
 * regenerates it.
 */
export function generateInputsHash(prompt: string): string {
  return hashString(prompt);
}

/** Id of the project screen's step, which records no progress. */
export const PROJECT_STEP_ID = 'project';

/** A step's state; a level step's comes from its level's own progress. */
export interface StepProgress {
  status?: 'started' | 'complete';
  /** Seconds on screen, summed across visits. */
  timeSpent: number;
  startedAt?: string;
  completedAt?: string;
  submitted?: boolean;
  answers?: StepAnswers;
  generatedInstructions?: GeneratedContent;
}

export interface Progress {
  steps: {[stepId: string]: StepProgress};
}

export const EMPTY_PROGRESS: Progress = {steps: {}};

const isComplete = (checkpoint: Checkpoint, progress: Progress) => {
  const last = checkpoint.steps[checkpoint.steps.length - 1];
  return !!last && progress.steps[last.id]?.status === 'complete';
};

/** Started by any step, complete with its last, unlocked by its requires. */
export function checkpointStatus(
  checkpoint: Checkpoint,
  pathway: Pathway,
  progress: Progress
): CheckpointStatus {
  if (isComplete(checkpoint, progress)) return 'complete';
  const unlocked = (checkpoint.requires || []).every(r => {
    const required = pathway.checkpoints.find(c => c.id === r);
    return !!required && isComplete(required, progress);
  });
  if (!unlocked) return 'locked';
  return checkpoint.steps.some(s => progress.steps[s.id]?.status)
    ? 'inProgress'
    : 'available';
}

export function getStatusMap(
  pathway: Pathway,
  progress: Progress
): CheckpointStatusMap {
  return Object.fromEntries(
    pathway.checkpoints.map(c => [c.id, checkpointStatus(c, pathway, progress)])
  );
}
