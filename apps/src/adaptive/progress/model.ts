// The progress model: each step's state for a student, and the status each
// checkpoint takes from its steps. Nothing here touches React or storage;
// useProgress and progressStore build on it.

import {hashString} from '@cdo/apps/utils';

import {Checkpoint} from '../types';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete'
  /** Demonstrated by the student's evidence and skippable, so passed without being played. */
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

/** One check of a project step's work, as the judge reported it. */
export interface ValidationAttempt {
  /** When the server recorded it. */
  at: string;
  pass: boolean;
  /** On the evidence levels of the skill the step measures. */
  evidenceLevel: number;
  /** Addressed to the student. */
  reason: string;
  /** The Langfuse trace the judge ran under. */
  traceId?: string;
}

/** The verdict in force on a step; undefined before its first check. */
export function latestValidation(
  entry: StepProgress | undefined
): ValidationAttempt | undefined {
  const history = entry?.validationHistory;
  return history?.[history.length - 1];
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
  /** Every check of a project step's work, oldest first. */
  validationHistory?: ValidationAttempt[];
}

export interface Progress {
  steps: {[stepId: string]: StepProgress};
}

export const EMPTY_PROGRESS: Progress = {steps: {}};

/**
 * The checkpoint's steps the student plays: every step without a showIf,
 * and a step with one only while its choice is the latest answer.
 */
export function visibleSteps(checkpoint: Checkpoint, progress: Progress) {
  return checkpoint.steps.filter(step => {
    if (!step.showIf) return true;
    const {stepId, questionId, choiceId} = step.showIf;
    const latest = progress.steps[stepId]?.answers?.[questionId]?.at(-1);
    return latest?.answerId === choiceId;
  });
}

/**
 * The step id to resume in a checkpoint: the first visible step that is not
 * yet complete. Returns undefined when all steps are complete.
 */
export function stepIdToResume(
  checkpoint: Checkpoint,
  progress: Progress
): string | undefined {
  return visibleSteps(checkpoint, progress).find(
    step => progress.steps[step.id]?.status !== 'complete'
  )?.id;
}

/** Whether the student finished the checkpoint: its last visible step is complete. */
export const isComplete = (checkpoint: Checkpoint, progress: Progress) => {
  const last = visibleSteps(checkpoint, progress).at(-1);
  return !!last && progress.steps[last.id]?.status === 'complete';
};

/** Whether the student has opened the checkpoint: any step has a status. */
export const isStarted = (checkpoint: Checkpoint, progress: Progress) =>
  checkpoint.steps.some(s => progress.steps[s.id]?.status);
