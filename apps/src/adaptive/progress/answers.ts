import {MultipleChoiceQuestion, QuestionsStep} from '../types';

/**
 * The AI Lessons prototype's AnswerRecord, which its AI consumers read, with
 * the choice named as quiz responses name it.
 */
export interface AnswerRecord {
  questionId: number;
  stepId: string;
  prompt: string;
  answer: string;
  selectedChoiceId: string;
  /** Of the latest submission; earlier ones are not kept. */
  outcome: 'correct' | 'incorrect';
  attempts: number;
  at: string;
}

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

/** The highest question index a student may open. */
export function reachableThrough(
  step: QuestionsStep,
  inputs: StudentInputs
): number {
  const blocking = step.questions.findIndex(
    q => q.type === 'MultipleChoiceQuestion' && !isPassed(inputs[q.id])
  );
  return blocking === -1 ? step.questions.length - 1 : blocking;
}
