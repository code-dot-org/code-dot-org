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

export const STATUS_LABELS: {[status in CheckpointStatus]: string} = {
  locked: 'Locked',
  available: 'Ready to start',
  inProgress: 'In progress',
  complete: 'Complete',
  skipped: 'Skipped',
};

/** Each checkpoint's status, by checkpoint id. */
export type CheckpointStatusMap = {[checkpointId: string]: CheckpointStatus};

/**
 * One submitted answer. isCorrect is absent for a survey question; text is
 * set for a free response question and for a typed answer to a multiple
 * choice question, whose answerId is then OTHER_CHOICE_ID.
 */
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

/** Why the chat alone opened Continue on a checked step. */
export type ChatUnlockReason =
  /** The chat reached the reply limit, which opens Continue regardless. */
  'limitReached';

/**
 * One entry in a step's validation history: a check of the student's work,
 * or, when it carries a `passReason`, the chat opening Continue instead.
 * Only work entries carry evidence; a chat entry has evidence level 0 and
 * carries what the student was told.
 */
export interface ValidationAttempt {
  /** When the server recorded it. */
  at: string;
  pass: boolean;
  /** On the evidence levels of the skill the step measures; 0 unless from work. */
  evidenceLevel: number;
  /** Addressed to the student. */
  reason: string;
  /** The Langfuse trace the judge ran under. */
  traceId?: string;
  /** Set only on a chat entry, which always passes; absent on every check of work. */
  passReason?: ChatUnlockReason;
  /** Replies in the chat when a chat entry opened Continue. */
  replies?: number;
}

/** The checks of a step's work, oldest first. */
export const workAttempts = (
  entry: StepProgress | undefined
): ValidationAttempt[] =>
  (entry?.validationHistory ?? []).filter(attempt => !attempt.passReason);

/** The chat entries on a step, oldest first. */
export const chatChecks = (
  entry: StepProgress | undefined
): ValidationAttempt[] =>
  (entry?.validationHistory ?? []).filter(attempt => !!attempt.passReason);

/** The verdict on a step's work in force; undefined before its first check. */
export function latestValidation(
  entry: StepProgress | undefined
): ValidationAttempt | undefined {
  return workAttempts(entry).at(-1);
}

/** Failed checks after which Continue opens anyway, since the judge can be wrong. */
export const FAILED_VALIDATIONS_TO_CONTINUE = 3;

/** Why Continue is open on a checked step, in the order the reasons are tried. */
export type ContinueUnlockReason =
  | 'validationPassed'
  | 'failedValidations'
  | ChatUnlockReason;

/** Why a checked step lets the student continue, or undefined while it does not. */
export function continueUnlockReason(
  entry: StepProgress | undefined
): ContinueUnlockReason | undefined {
  const work = workAttempts(entry);
  if (work.some(attempt => attempt.pass)) return 'validationPassed';
  if (work.length >= FAILED_VALIDATIONS_TO_CONTINUE) return 'failedValidations';
  return chatChecks(entry).find(check => check.pass)?.passReason;
}

/** Whether a checked step's work or chat lets the student continue past it. */
export const validationAllowsContinue = (
  entry: StepProgress | undefined
): boolean => continueUnlockReason(entry) !== undefined;

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
  /** Every check of a project step's work or chat, oldest first. */
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

/** Seconds the student has spent on steps, over every step with progress. */
export function totalTimeSpent(progress: Progress): number {
  return Object.values(progress.steps).reduce(
    (sum, step) => sum + (step.timeSpent ?? 0),
    0
  );
}

/** The share of the checkpoint's visible steps that are complete, 0 to 1. */
export function stepsCompleteShare(
  checkpoint: Checkpoint,
  progress: Progress
): number {
  const steps = visibleSteps(checkpoint, progress);
  if (steps.length === 0) return 0;
  const done = steps.filter(
    step => progress.steps[step.id]?.status === 'complete'
  ).length;
  return done / steps.length;
}

/** Whether the student finished the checkpoint: its last visible step is complete. */
export const isComplete = (checkpoint: Checkpoint, progress: Progress) => {
  const last = visibleSteps(checkpoint, progress).at(-1);
  return !!last && progress.steps[last.id]?.status === 'complete';
};

/** Whether the student has opened the checkpoint: any step has a status. */
export const isStarted = (checkpoint: Checkpoint, progress: Progress) =>
  checkpoint.steps.some(s => progress.steps[s.id]?.status);
