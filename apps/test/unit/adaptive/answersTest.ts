import {
  AnswerRecord,
  answerRecord,
  isCorrectSelection,
  isPassed,
  reachableThrough,
} from '@cdo/apps/adaptive/progress';
import {
  MultipleChoiceQuestion,
  Question,
  QuestionsStep,
} from '@cdo/apps/adaptive/types';

const first: MultipleChoiceQuestion = {
  id: 1,
  type: 'MultipleChoiceQuestion',
  questionName: 'first',
  stem: 'Pick one',
  choices: [
    {id: 'a', text: 'A'},
    {id: 'b', text: 'B'},
    {id: 'c', text: 'C'},
  ],
  correctChoiceId: 'a',
  page: 1,
};

const third: MultipleChoiceQuestion = {...first, id: 3, questionName: 'third'};

const freeResponse: Question = {
  id: 'fr',
  type: 'freeResponse',
  text: 'Say something',
};

const stepOf = (...questions: Question[]): QuestionsStep => ({
  id: 'quiz',
  title: 'Quiz',
  kind: 'questions',
  questions,
});

const now = new Date('2026-09-30T12:00:00.000Z');

describe('isCorrectSelection', () => {
  it('accepts only the correct choice', () => {
    expect(isCorrectSelection(first, 'a')).toBe(true);
    expect(isCorrectSelection(first, 'b')).toBe(false);
  });
});

describe('answerRecord', () => {
  const step = stepOf(first);

  it('records the choice id and text', () => {
    expect(answerRecord(step, first, 'b', undefined, now)).toEqual({
      questionId: 1,
      stepId: 'quiz',
      prompt: 'Pick one',
      answer: 'B',
      selectedChoiceId: 'b',
      outcome: 'incorrect',
      attempts: 1,
      at: '2026-09-30T12:00:00.000Z',
    });
  });

  it('counts attempts across a wrong then right answer', () => {
    const wrong = answerRecord(step, first, 'b', undefined, now);
    const right = answerRecord(step, first, 'a', wrong, now);
    expect(right).toMatchObject({
      answer: 'A',
      selectedChoiceId: 'a',
      outcome: 'correct',
      attempts: 2,
    });
  });
});

describe('reachableThrough', () => {
  const step = stepOf(first, freeResponse, third);
  const passed = (question: MultipleChoiceQuestion): AnswerRecord =>
    answerRecord(step, question, 'a', undefined);
  const failed = (question: MultipleChoiceQuestion): AnswerRecord =>
    answerRecord(step, question, 'b', undefined);

  it('stops at the first question not passed', () => {
    expect(reachableThrough(step, {})).toBe(0);
    expect(reachableThrough(step, {1: failed(first)})).toBe(0);
  });

  it('passes over placeholder question types', () => {
    expect(isPassed(passed(first))).toBe(true);
    expect(reachableThrough(step, {1: passed(first)})).toBe(2);
  });

  it('reaches every question once all are passed', () => {
    expect(reachableThrough(step, {1: passed(first), 3: passed(third)})).toBe(
      2
    );
  });
});
