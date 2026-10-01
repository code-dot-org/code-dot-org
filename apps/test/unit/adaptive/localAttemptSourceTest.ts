import {act, renderHook} from '@testing-library/react-hooks';
import {useState} from 'react';

import {useLocalAttemptSource} from '@cdo/apps/adaptive/progress/localAttemptSource';
import {MultipleChoiceQuestion, QuestionsStep} from '@cdo/apps/adaptive/types';
import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';

const question = (id: number): MultipleChoiceQuestion => ({
  id,
  type: 'MultipleChoiceQuestion',
  questionName: `q${id}`,
  stem: `Question ${id}`,
  choices: [
    {id: 'a', text: 'A'},
    {id: 'b', text: 'B'},
  ],
  correctChoiceId: 'a',
  page: 1,
});

const stepOf = (overrides: Partial<QuestionsStep> = {}): QuestionsStep => ({
  id: 'quiz',
  title: 'Quiz',
  kind: 'questions',
  questions: [question(1), question(2), question(3)],
  ...overrides,
});

// Holds the attempts as PathwayApp does, so saves feed back in as props.
function renderSource(step = stepOf(), initial: QuizAttemptData[] = []) {
  return renderHook(() => {
    const [attempts, setAttempts] = useState(initial);
    return {
      attempts,
      source: useLocalAttemptSource(step, attempts, setAttempts),
    };
  });
}

describe('useLocalAttemptSource', () => {
  it('has no attempt until one begins, then the first', async () => {
    const {result} = renderSource();
    expect(result.current.source.attempt).toBeNull();
    await act(async () => {
      await result.current.source.beginAttempt();
    });
    expect(result.current.source.attempt).toMatchObject({
      id: 1,
      attemptNumber: 1,
      submittedAt: null,
      expiresAt: null,
      questionResultsInProgress: [],
    });
    expect(result.current.attempts).toHaveLength(1);
  });

  it('saves answers without changing the attempt the view holds', async () => {
    const {result} = renderSource();
    await act(async () => {
      await result.current.source.beginAttempt();
    });
    const held = result.current.source.attempt;
    await act(async () => {
      await result.current.source.submitQuestionResponse(1, {
        selectedChoiceId: 'b',
      });
      await result.current.source.submitQuestionResponse(1, {
        selectedChoiceId: 'a',
      });
    });
    expect(result.current.source.attempt).toBe(held);
    expect(result.current.attempts[0].questionResultsInProgress).toEqual([
      {quizQuestionId: 1, selectedChoiceId: 'a'},
    ]);
  });

  it('grades on finish, counting an unanswered question wrong', async () => {
    const {result} = renderSource();
    await act(async () => {
      await result.current.source.beginAttempt();
      await result.current.source.submitQuestionResponse(1, {
        selectedChoiceId: 'a',
      });
    });
    await act(async () => {
      await result.current.source.finishAttempt({2: {selectedChoiceId: 'a'}});
    });
    const finished = result.current.source.attempt;
    expect(finished).toMatchObject({score: 2, maxScore: 3});
    expect(finished?.submittedAt).toEqual(expect.any(String));
    expect(finished?.questionResultsInProgress).toBeUndefined();
    expect(finished?.questionResults).toEqual([
      {
        quizQuestionId: 1,
        selectedChoiceId: 'a',
        correct: true,
        explanation: null,
        correctChoiceId: 'a',
      },
      {
        quizQuestionId: 2,
        selectedChoiceId: 'a',
        correct: true,
        explanation: null,
        correctChoiceId: 'a',
      },
      {
        quizQuestionId: 3,
        selectedChoiceId: null,
        correct: false,
        explanation: null,
        correctChoiceId: 'a',
      },
    ]);
    expect(result.current.attempts[0]).toEqual(finished);
  });

  it('keeps earlier attempts on a retake', async () => {
    const {result} = renderSource(stepOf({allowMultipleAttempts: true}));
    await act(async () => {
      await result.current.source.beginAttempt();
    });
    await act(async () => {
      await result.current.source.finishAttempt({});
    });
    await act(async () => {
      await result.current.source.beginAttempt();
    });
    expect(result.current.attempts.map(a => a.attemptNumber)).toEqual([1, 2]);
    expect(result.current.attempts[0].submittedAt).toEqual(expect.any(String));
    expect(result.current.source.attempt).toMatchObject({
      attemptNumber: 2,
      canRetake: true,
    });
  });

  it('offers retakes only when the step allows multiple attempts', async () => {
    const {result} = renderSource();
    await act(async () => {
      await result.current.source.beginAttempt();
    });
    expect(result.current.source.attempt?.canRetake).toBe(false);
  });

  it('resumes the latest stored attempt', () => {
    const stored: QuizAttemptData = {
      id: 1,
      attemptNumber: 1,
      submittedAt: null,
      score: null,
      maxScore: null,
      expiresAt: null,
      canRetake: false,
      questionResultsInProgress: [{quizQuestionId: 2, selectedChoiceId: 'b'}],
    };
    const {result} = renderSource(stepOf(), [stored]);
    expect(result.current.source.attempt).toBe(stored);
  });
});
