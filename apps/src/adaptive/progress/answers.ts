// A student's answers to questions steps, in the shape of the AI Lessons
// prototype's AnswerRecord so the consumers ported from it read them
// unchanged, with the choice named as quiz responses name it. Nothing here
// touches React or storage.

import {MultipleChoiceQuestion, QuestionsStep} from '../types';

export interface AnswerRecord {
  questionId: number;
  stepId: string;
  /** The question stem as shown. */
  prompt: string;
  /** The selected choice's text. */
  answer: string;
  selectedChoiceId: string;
  /** Of the latest submission. */
  outcome: 'correct' | 'incorrect';
  /** Submissions so far. */
  attempts: number;
  /** ISO 8601 time of the latest submission. */
  at: string;
}

/** The latest answer record, by question id. */
export type StudentInputs = {[questionId: number]: AnswerRecord};

export const isCorrectSelection = (
  question: MultipleChoiceQuestion,
  choiceId: string
) => choiceId === question.correctChoiceId;

export function answerRecord(
  step: QuestionsStep,
  question: MultipleChoiceQuestion,
  choiceId: string,
  previous: AnswerRecord | undefined,
  now: Date = new Date()
): AnswerRecord {
  return {
    questionId: question.id,
    stepId: step.id,
    prompt: question.stem,
    answer: question.choices.find(c => c.id === choiceId)?.text ?? '',
    selectedChoiceId: choiceId,
    outcome: isCorrectSelection(question, choiceId) ? 'correct' : 'incorrect',
    attempts: (previous?.attempts || 0) + 1,
    at: now.toISOString(),
  };
}

export const isPassed = (record: AnswerRecord | undefined) =>
  record?.outcome === 'correct';

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
    q => q.type === 'MultipleChoiceQuestion' && !isPassed(inputs[q.id])
  );
  return blocking === -1 ? step.questions.length - 1 : blocking;
}
