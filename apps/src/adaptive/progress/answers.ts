// A student's answers to questions steps, in the shape of the AI Lessons
// prototype's AnswerRecord so the consumers ported from it read them
// unchanged. Nothing here touches React or storage.

import {MultipleChoiceQuestion, QuestionsStep} from '../types';

export interface AnswerRecord {
  questionId: string;
  stepId: string;
  /** The question text as shown. */
  prompt: string;
  /** The selected labels, joined with "; ". */
  answer: string;
  /** Single select only. */
  optionId?: string;
  /** Multi select only. */
  optionIds?: string[];
  /** Of the latest submission. */
  outcome: 'correct' | 'incorrect';
  /** Submissions so far. */
  attempts: number;
  /** ISO 8601 time of the latest submission. */
  at: string;
}

/** The latest answer record, by question id. */
export type StudentInputs = {[questionId: string]: AnswerRecord};

/** Correct when the chosen set is exactly the set of options marked correct. */
export function isCorrectSelection(
  question: MultipleChoiceQuestion,
  chosen: string[]
): boolean {
  const correct = question.options.filter(o => o.correct).map(o => o.id);
  return (
    correct.length > 0 &&
    chosen.length === correct.length &&
    chosen.every(id => correct.includes(id))
  );
}

export function answerRecord(
  step: QuestionsStep,
  question: MultipleChoiceQuestion,
  chosen: string[],
  previous: AnswerRecord | undefined,
  now: Date = new Date()
): AnswerRecord {
  const answer = question.options
    .filter(o => chosen.includes(o.id))
    .map(o => o.label)
    .join('; ');
  return {
    questionId: question.id,
    stepId: step.id,
    prompt: question.text,
    answer,
    ...(question.multiSelect ? {optionIds: chosen} : {optionId: chosen[0]}),
    outcome: isCorrectSelection(question, chosen) ? 'correct' : 'incorrect',
    attempts: (previous?.attempts || 0) + 1,
    at: now.toISOString(),
  };
}

export const isPassed = (record: AnswerRecord | undefined) =>
  record?.outcome === 'correct';

/** The selection a record holds, whichever select mode wrote it. */
export const recordedSelection = (record: AnswerRecord | undefined) =>
  record?.optionIds || (record?.optionId ? [record.optionId] : []);

/**
 * The highest question index a student may open: the first multiple-choice
 * question not yet passed, or the last question once all are. Placeholder
 * question types never block.
 */
export function reachableThrough(
  step: QuestionsStep,
  inputs: StudentInputs
): number {
  const blocking = step.questions.findIndex(
    q => q.type === 'multipleChoice' && !isPassed(inputs[q.id])
  );
  return blocking === -1 ? step.questions.length - 1 : blocking;
}
