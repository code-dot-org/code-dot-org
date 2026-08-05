import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import QuestionFlow from '@cdo/apps/aiLessons/QuestionFlow';
import {AnswerRecord} from '@cdo/apps/aiLessons/studentInputs';
import {QuestionsStep} from '@cdo/apps/aiLessons/types';

const interviewStep: QuestionsStep = {
  id: 'interview',
  kind: 'questions',
  title: 'Tell us about your artist',
  questions: [
    {id: 'artist', type: 'freeResponse', prompt: 'Which artist?'},
    {
      id: 'confidence',
      type: 'scale',
      prompt: 'How confident?',
      scale: {min: 0, max: 10},
    },
  ],
};

const quizStep: QuestionsStep = {
  id: 'quiz',
  kind: 'questions',
  title: 'Quick check',
  questions: [
    {
      id: 'q',
      type: 'multipleChoice',
      prompt: 'Pick the element',
      validation: 'key',
      options: [
        {id: 'right', label: '<p>Hello</p>', correct: true},
        {id: 'wrong', label: '<p>Hello'},
      ],
    },
  ],
};

const branchStep: QuestionsStep = {
  id: 'check-in',
  kind: 'questions',
  title: 'What next?',
  questions: [
    {
      id: 'what-next',
      type: 'multipleChoice',
      prompt: 'What next?',
      options: [
        {id: 'more-html', label: 'More HTML', goTo: 'html-extra'},
        {id: 'stay', label: 'Stay here', goTo: 'free-play'},
      ],
    },
  ],
};

describe('QuestionFlow', () => {
  // Advancing between questions plays a timed exit animation before the
  // next question mounts; flush it with fake timers.
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const flushTransition = () => act(() => void jest.runAllTimers());

  it('records a free response and advances to the next question', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={interviewStep}
        inputs={{}}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Type your answer…'), {
      target: {value: 'Beyonce'},
    });
    fireEvent.click(screen.getByText('Next →'));

    expect(onAnswer).toHaveBeenCalledTimes(1);
    const record: AnswerRecord = onAnswer.mock.calls[0][0];
    expect(record.questionId).toBe('artist');
    expect(record.answer).toBe('Beyonce');
    expect(record.outcome).toBe('accepted');
    expect(onComplete).not.toHaveBeenCalled();
    // The scale question mounts once the exit transition finishes.
    flushTransition();
    expect(screen.getByText('How confident?')).toBeDefined();
  });

  it('completes the step after the last question', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={interviewStep}
        inputs={{}}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Type your answer…'), {
      target: {value: 'BTS'},
    });
    fireEvent.click(screen.getByText('Next →'));
    flushTransition();
    fireEvent.click(screen.getByText('Finish →'));

    expect(onAnswer).toHaveBeenCalledTimes(2);
    const scaleRecord: AnswerRecord = onAnswer.mock.calls[1][0];
    expect(scaleRecord.questionId).toBe('confidence');
    expect(scaleRecord.value).toBe(5);
    expect(onComplete).toHaveBeenCalledWith();
  });

  it('gates a key-validated question until answered correctly', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={quizStep}
        inputs={{}}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    fireEvent.click(screen.getByText('<p>Hello'));
    fireEvent.click(screen.getByText('Finish →'));
    expect(screen.getByText('Not quite — try again!')).toBeDefined();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onAnswer.mock.calls[0][0].outcome).toBe('incorrect');

    // Picking a different option clears the try-again feedback.
    fireEvent.click(screen.getByText('<p>Hello</p>'));
    expect(screen.queryByText('Not quite — try again!')).toBeNull();
    fireEvent.click(screen.getByText('Finish →'));
    expect(screen.getByText('Correct!')).toBeDefined();
    expect(onAnswer.mock.calls[1][0].outcome).toBe('correct');
    expect(onAnswer.mock.calls[1][0].attempts).toBe(1);
    flushTransition();
    expect(onComplete).toHaveBeenCalledWith();
  });

  it('completes with the option id on a submitted branch choice', () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    render(
      <QuestionFlow
        step={branchStep}
        inputs={{}}
        path={['a', 'free-play']}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    // The option whose target was already visited is badged.
    expect(screen.getByText('Stay here ✓')).toBeDefined();

    fireEvent.click(screen.getByText('More HTML'));
    fireEvent.click(screen.getByText('Finish →'));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer.mock.calls[0][0].optionId).toBe('more-html');
    expect(onComplete).toHaveBeenCalledWith('more-html');
  });

  it('counts attempts across retries using prior inputs', () => {
    const onAnswer = jest.fn();
    render(
      <QuestionFlow
        step={quizStep}
        inputs={{
          q: {
            questionId: 'q',
            stepId: 'quiz',
            prompt: 'Pick the element',
            answer: '<p>Hello',
            optionId: 'wrong',
            outcome: 'incorrect',
            attempts: 2,
            at: '2026-01-01T00:00:00Z',
          },
        }}
        onAnswer={onAnswer}
        onComplete={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('<p>Hello'));
    fireEvent.click(screen.getByText('Finish →'));
    expect(onAnswer.mock.calls[0][0].attempts).toBe(3);
  });

  it('navigates back and forward via the progress dots', () => {
    render(
      <QuestionFlow
        step={interviewStep}
        inputs={{}}
        onAnswer={jest.fn()}
        onComplete={jest.fn()}
      />
    );

    // Unreached questions aren't clickable.
    const dot2 = screen.getByLabelText('Go to question 2') as HTMLButtonElement;
    expect(dot2.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('Type your answer…'), {
      target: {value: 'Beyonce'},
    });
    fireEvent.click(screen.getByText('Next →'));
    flushTransition();
    expect(screen.getByText('How confident?')).toBeDefined();

    // Back to question 1 via its dot…
    fireEvent.click(screen.getByLabelText('Go to question 1'));
    flushTransition();
    expect(screen.getByText('Which artist?')).toBeDefined();

    // …and forward again: question 2 stays reachable once visited.
    fireEvent.click(screen.getByLabelText('Go to question 2'));
    flushTransition();
    expect(screen.getByText('How confident?')).toBeDefined();
  });
});
