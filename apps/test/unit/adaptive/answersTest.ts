import {
  AnswerRecord,
  answerRecord,
  isCorrectSelection,
  isPassed,
  reachableThrough,
  recordedSelection,
} from '@cdo/apps/adaptive/progress';
import {
  MultipleChoiceQuestion,
  Question,
  QuestionsStep,
} from '@cdo/apps/adaptive/types';

const single: MultipleChoiceQuestion = {
  id: 'q1',
  type: 'multipleChoice',
  text: 'Pick one',
  options: [
    {id: 'a', label: 'A', correct: true},
    {id: 'b', label: 'B'},
    {id: 'c', label: 'C'},
  ],
};

const multi: MultipleChoiceQuestion = {
  id: 'q2',
  type: 'multipleChoice',
  text: 'Pick all',
  multiSelect: true,
  options: [
    {id: 'a', label: 'A', correct: true},
    {id: 'b', label: 'B', correct: true},
    {id: 'c', label: 'C'},
  ],
};

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
  it('needs exactly the set of correct options, in any order', () => {
    expect(isCorrectSelection(single, ['a'])).toBe(true);
    expect(isCorrectSelection(single, ['b'])).toBe(false);
    expect(isCorrectSelection(multi, ['b', 'a'])).toBe(true);
    expect(isCorrectSelection(multi, ['a'])).toBe(false);
    expect(isCorrectSelection(multi, ['a', 'b', 'c'])).toBe(false);
  });

  it('accepts nothing when no option is marked correct', () => {
    const unkeyed = {...single, options: single.options.map(o => ({...o}))};
    unkeyed.options[0].correct = undefined;
    expect(isCorrectSelection(unkeyed, ['a'])).toBe(false);
  });
});

describe('answerRecord', () => {
  const step = stepOf(single, multi);

  it('records a single-select answer by optionId', () => {
    expect(answerRecord(step, single, ['b'], undefined, now)).toEqual({
      questionId: 'q1',
      stepId: 'quiz',
      prompt: 'Pick one',
      answer: 'B',
      optionId: 'b',
      outcome: 'incorrect',
      attempts: 1,
      at: '2026-09-30T12:00:00.000Z',
    });
  });

  it('records a multi-select answer by optionIds, labels in option order', () => {
    const record = answerRecord(step, multi, ['b', 'a'], undefined, now);
    expect(record.optionIds).toEqual(['b', 'a']);
    expect(record.optionId).toBeUndefined();
    expect(record.answer).toBe('A; B');
    expect(record.outcome).toBe('correct');
  });

  it('counts attempts across a wrong then right answer', () => {
    const wrong = answerRecord(step, single, ['b'], undefined, now);
    const right = answerRecord(step, single, ['a'], wrong, now);
    expect(right).toMatchObject({
      answer: 'A',
      optionId: 'a',
      outcome: 'correct',
      attempts: 2,
    });
  });
});

describe('recordedSelection', () => {
  it('reads either select mode and nothing from no record', () => {
    const step = stepOf(single, multi);
    expect(
      recordedSelection(answerRecord(step, single, ['a'], undefined))
    ).toEqual(['a']);
    expect(
      recordedSelection(answerRecord(step, multi, ['a', 'b'], undefined))
    ).toEqual(['a', 'b']);
    expect(recordedSelection(undefined)).toEqual([]);
  });
});

describe('reachableThrough', () => {
  const second = {...single, id: 'q3'};
  const step = stepOf(single, freeResponse, second);
  const passed = (question: MultipleChoiceQuestion): AnswerRecord =>
    answerRecord(step, question, ['a'], undefined);
  const failed = (question: MultipleChoiceQuestion): AnswerRecord =>
    answerRecord(step, question, ['b'], undefined);

  it('stops at the first question not passed', () => {
    expect(reachableThrough(step, {})).toBe(0);
    expect(reachableThrough(step, {q1: failed(single)})).toBe(0);
  });

  it('passes over placeholder question types', () => {
    expect(isPassed(passed(single))).toBe(true);
    expect(reachableThrough(step, {q1: passed(single)})).toBe(2);
  });

  it('reaches every question once all are passed', () => {
    expect(
      reachableThrough(step, {q1: passed(single), q3: passed(second)})
    ).toBe(2);
  });
});
