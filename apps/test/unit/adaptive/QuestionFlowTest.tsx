import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import QuestionFlow from '@cdo/apps/adaptive/QuestionFlow';
import {AnswerRecord, QuestionStep} from '@cdo/apps/adaptive/types';

// Two ungraded questions: no option is marked correct.
const surveyStep: QuestionStep = {
  id: 'survey',
  kind: 'question',
  title: 'About you',
  questions: [
    {
      id: 'experience',
      type: 'multipleChoice',
      prompt: 'Have you built a website before?',
      options: [
        {id: 'yes', label: 'Yes'},
        {id: 'no', label: 'No'},
      ],
    },
    {
      id: 'interest',
      type: 'multipleChoice',
      prompt: 'What interests you?',
      multiSelect: true,
      options: [
        {id: 'games', label: 'Games'},
        {id: 'art', label: 'Art'},
      ],
    },
  ],
};

const quizStep: QuestionStep = {
  id: 'quiz',
  kind: 'question',
  title: 'Quick check',
  questions: [
    {
      id: 'q',
      type: 'multipleChoice',
      prompt: 'Pick the element',
      options: [
        {id: 'right', label: '<p>Hello</p>', correct: true},
        {id: 'wrong', label: '<p>Hello'},
      ],
    },
  ],
};

const multiQuizStep: QuestionStep = {
  id: 'multi',
  kind: 'question',
  title: 'Check all',
  questions: [
    {
      id: 'tags',
      type: 'multipleChoice',
      prompt: 'Which are HTML tags?',
      multiSelect: true,
      options: [
        {id: 'p', label: 'p', correct: true},
        {id: 'h1', label: 'h1', correct: true},
        {id: 'css', label: 'css'},
      ],
    },
  ],
};

describe('QuestionFlow', () => {
  // Advancing plays a timed exit animation before the next question
  // mounts; flush it with fake timers.
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const flushTransition = () => act(() => void jest.runAllTimers());

  it('records an ungraded answer and advances to the next question', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={surveyStep}
        answers={{}}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('Next'));

    expect(onAnswer).toHaveBeenCalledTimes(1);
    const record: AnswerRecord = onAnswer.mock.calls[0][0];
    expect(record.questionId).toBe('experience');
    expect(record.stepId).toBe('survey');
    expect(record.optionIds).toEqual(['yes']);
    expect(record.outcome).toBe('accepted');
    expect(record.attempts).toBe(1);
    expect(onComplete).not.toHaveBeenCalled();
    flushTransition();
    expect(screen.getByText('What interests you?')).toBeDefined();
  });

  it('completes the step after the last question', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={surveyStep}
        answers={{}}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByText('No'));
    fireEvent.click(screen.getByText('Next'));
    flushTransition();
    fireEvent.click(screen.getByText('Games'));
    fireEvent.click(screen.getByText('Art'));
    fireEvent.click(screen.getByText('Finish'));

    expect(onAnswer).toHaveBeenCalledTimes(2);
    expect(onAnswer.mock.calls[1][0].optionIds).toEqual(['games', 'art']);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('disables submission until an option is chosen', () => {
    render(
      <QuestionFlow
        step={quizStep}
        answers={{}}
        onAnswer={jest.fn()}
        onComplete={jest.fn()}
      />
    );
    expect(
      (screen.getByText('Finish').closest('button') as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('gates a graded question until answered correctly', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={quizStep}
        answers={{}}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    fireEvent.click(screen.getByText('<p>Hello'));
    fireEvent.click(screen.getByText('Finish'));
    expect(screen.getByText('Not quite. Try again!')).toBeDefined();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onAnswer.mock.calls[0][0].outcome).toBe('incorrect');

    // Picking a different option clears the try-again feedback.
    fireEvent.click(screen.getByText('<p>Hello</p>'));
    expect(screen.queryByText('Not quite. Try again!')).toBeNull();
    fireEvent.click(screen.getByText('Finish'));
    expect(screen.getByText('Correct!')).toBeDefined();
    expect(onAnswer.mock.calls[1][0].outcome).toBe('correct');
    flushTransition();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('grades a multi-select against the exact correct set', () => {
    const onAnswer = jest.fn();
    render(
      <QuestionFlow
        step={multiQuizStep}
        answers={{}}
        onAnswer={onAnswer}
        onComplete={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('p'));
    fireEvent.click(screen.getByText('Finish'));
    expect(onAnswer.mock.calls[0][0].outcome).toBe('incorrect');

    fireEvent.click(screen.getByText('h1'));
    fireEvent.click(screen.getByText('Finish'));
    expect(onAnswer.mock.calls[1][0].optionIds).toEqual(['p', 'h1']);
    expect(onAnswer.mock.calls[1][0].outcome).toBe('correct');
  });

  it('counts attempts across retries using prior answers', () => {
    const onAnswer = jest.fn();
    render(
      <QuestionFlow
        step={quizStep}
        answers={{
          q: {
            questionId: 'q',
            stepId: 'quiz',
            optionIds: ['wrong'],
            outcome: 'incorrect',
            attempts: 2,
            at: '2026-01-01T00:00:00Z',
          },
        }}
        onAnswer={onAnswer}
        onComplete={jest.fn()}
      />
    );
    // The prior choice is preselected.
    expect(screen.getByText('<p>Hello').getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.click(screen.getByText('Finish'));
    expect(onAnswer.mock.calls[0][0].attempts).toBe(3);
  });

  it('navigates back and forward via the progress dots', () => {
    render(
      <QuestionFlow
        step={surveyStep}
        answers={{}}
        onAnswer={jest.fn()}
        onComplete={jest.fn()}
      />
    );

    // Unreached questions are not clickable.
    const dot2 = screen.getByLabelText('Go to question 2') as HTMLButtonElement;
    expect(dot2.disabled).toBe(true);

    fireEvent.click(screen.getByText('Yes'));
    fireEvent.click(screen.getByText('Next'));
    flushTransition();
    expect(screen.getByText('What interests you?')).toBeDefined();

    fireEvent.click(screen.getByLabelText('Go to question 1'));
    flushTransition();
    expect(screen.getByText('Have you built a website before?')).toBeDefined();

    // Question 2 stays reachable once visited.
    fireEvent.click(screen.getByLabelText('Go to question 2'));
    flushTransition();
    expect(screen.getByText('What interests you?')).toBeDefined();
  });
});
