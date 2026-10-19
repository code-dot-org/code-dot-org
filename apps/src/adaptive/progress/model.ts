// The progress model: each step's state for a student, and the status each
// checkpoint takes from its steps. Nothing here touches React or storage;
// useProgress and progressStore build on it.

import {hashString} from '@cdo/apps/utils';

import type {RoutingRecord} from '../routing/routeAfterCompletion';
import {Checkpoint, Pathway} from '../types';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete'
  | 'skipped';

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
  /** Skipped: completed on the student's behalf by the router, never opened. */
  status?: 'started' | 'complete' | 'skipped';
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
  /** Temporary: logs the last routing verdict until the UI that applies it lands. Not stored. */
  lastRouting?: RoutingRecord;
}

export const EMPTY_PROGRESS: Progress = {steps: {}};

const lastStepStatus = (checkpoint: Checkpoint, progress: Progress) => {
  const last = checkpoint.steps[checkpoint.steps.length - 1];
  return last && progress.steps[last.id]?.status;
};

// Complete or skipped: enough to unlock what requires it.
const isDone = (checkpoint: Checkpoint, progress: Progress) => {
  const status = lastStepStatus(checkpoint, progress);
  return status === 'complete' || status === 'skipped';
};

/** Started by any step, complete or skipped with its last, unlocked by its requires. */
export function checkpointStatus(
  checkpoint: Checkpoint,
  pathway: Pathway,
  progress: Progress
): CheckpointStatus {
  const last = lastStepStatus(checkpoint, progress);
  if (last === 'complete') return 'complete';
  const started = checkpoint.steps.some(s => {
    const status = progress.steps[s.id]?.status;
    return status === 'started' || status === 'complete';
  });
  // Opening a skipped checkpoint takes it back up; the skip stands until it is finished.
  if (last === 'skipped' && !started) return 'skipped';
  const unlocked = (checkpoint.requires || []).every(r => {
    const required = pathway.checkpoints.find(c => c.id === r);
    return !!required && isDone(required, progress);
  });
  if (!unlocked) return 'locked';
  return started ? 'inProgress' : 'available';
}

export function getStatusMap(
  pathway: Pathway,
  progress: Progress
): CheckpointStatusMap {
  return Object.fromEntries(
    pathway.checkpoints.map(c => [c.id, checkpointStatus(c, pathway, progress)])
  );
}
