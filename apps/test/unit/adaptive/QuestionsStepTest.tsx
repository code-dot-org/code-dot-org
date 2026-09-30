import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {AnswerRecord, StudentInputs} from '@cdo/apps/adaptive/progress';
import {QuestionsStep as Step} from '@cdo/apps/adaptive/types';
import QuestionsStep from '@cdo/apps/adaptive/views/steps/QuestionsStep';

const step: Step = {
  id: 'quiz',
  title: 'Quiz',
  kind: 'questions',
  questions: [
    {
      id: 1,
      type: 'MultipleChoiceQuestion',
      questionName: 'first',
      stem: 'First question',
      choices: [
        {id: 'a', text: 'Right'},
        {id: 'b', text: 'Wrong'},
      ],
      correctChoiceId: 'a',
      page: 1,
    },
    {id: 'fr', type: 'freeResponse', text: 'Say something'},
    {
      id: 3,
      type: 'MultipleChoiceQuestion',
      questionName: 'third',
      stem: 'Third question',
      choices: [
        {id: 'a', text: 'Yes'},
        {id: 'b', text: 'No'},
      ],
      correctChoiceId: 'a',
      page: 1,
    },
  ],
};

// Holds inputs the way PathwayApp does, so recorded answers feed back in.
function renderStep(initial: StudentInputs = {}) {
  const onAnswer = jest.fn();
  const onComplete = jest.fn();
  const Host = () => {
    const [inputs, setInputs] = useState(initial);
    return (
      <QuestionsStep
        step={step}
        inputs={inputs}
        onAnswer={(record: AnswerRecord) => {
          onAnswer(record);
          setInputs(i => ({...i, [record.questionId]: record}));
        }}
        onComplete={onComplete}
      />
    );
  };
  render(<Host />);
  return {onAnswer, onComplete};
}

const choose = (label: string) => fireEvent.click(screen.getByLabelText(label));
const next = () => fireEvent.click(screen.getByRole('button', {name: /Next/}));
const dot = (n: number) =>
  screen.getByRole('button', {name: `Go to question ${n}`});
const finishTransition = () =>
  act(() => {
    jest.runOnlyPendingTimers();
  });

describe('QuestionsStep', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('keeps the student on a wrong answer and announces the retry', () => {
    const {onAnswer} = renderStep();
    choose('Wrong');
    next();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Not quite — try again!'
    );
    expect(onAnswer).toHaveBeenLastCalledWith(
      expect.objectContaining({outcome: 'incorrect', attempts: 1})
    );
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('First question')).toBeInTheDocument();
  });

  it('clears the retry message when the selection changes', () => {
    renderStep();
    choose('Wrong');
    next();
    choose('Right');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('records wrong then right and advances after the pause', () => {
    const {onAnswer} = renderStep();
    choose('Wrong');
    next();
    choose('Right');
    next();
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    expect(onAnswer).toHaveBeenCalledTimes(2);
    expect(onAnswer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        questionId: 1,
        answer: 'Right',
        selectedChoiceId: 'a',
        outcome: 'correct',
        attempts: 2,
      })
    );
    finishTransition();
    finishTransition();
    expect(screen.getByText('Say something')).toBeInTheDocument();
  });

  it('disables the dots during the correct pause but keeps Next focused', () => {
    renderStep();
    choose('Right');
    const submit = screen.getByRole('button', {name: /Next/});
    submit.focus();
    fireEvent.click(submit);
    expect(dot(1)).toBeDisabled();
    expect(dot(2)).toBeDisabled();
    expect(submit).toHaveFocus();
    expect(submit).toHaveAttribute('aria-disabled', 'true');
  });

  it('labels the dots as one group', () => {
    renderStep();
    expect(
      screen.getByRole('group', {name: 'Question progress'})
    ).toBeInTheDocument();
  });

  it('blocks dots past the first question not passed', () => {
    renderStep();
    expect(dot(2)).toBeDisabled();
    expect(dot(3)).toBeDisabled();
  });

  it('passes over a placeholder and reaches the question after it', () => {
    renderStep();
    choose('Right');
    next();
    finishTransition();
    finishTransition();
    expect(screen.getByText(/not available yet/)).toBeInTheDocument();
    expect(dot(3)).toBeEnabled();
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    finishTransition();
    expect(screen.getByText('Third question')).toHaveFocus();
  });

  it('reopens a passed question read-only and records nothing more', () => {
    const {onAnswer} = renderStep();
    choose('Right');
    next();
    finishTransition();
    finishTransition();
    fireEvent.click(dot(1));
    finishTransition();
    expect(screen.getByText('First question')).toHaveFocus();
    expect(screen.getByLabelText('Right')).toBeChecked();
    expect(screen.getByLabelText('Right')).toBeDisabled();
    next();
    finishTransition();
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Say something')).toBeInTheDocument();
  });

  it('makes answered questions reachable on a fresh mount', () => {
    renderStep({
      1: {
        questionId: 1,
        stepId: 'quiz',
        prompt: 'First question',
        answer: 'Right',
        selectedChoiceId: 'a',
        outcome: 'correct',
        attempts: 1,
        at: '2026-09-30T00:00:00.000Z',
      },
    });
    expect(dot(3)).toBeEnabled();
    expect(screen.getByText('First question')).not.toHaveFocus();
  });

  it('completes the step after the last question is answered', () => {
    const {onComplete} = renderStep();
    choose('Right');
    next();
    finishTransition();
    finishTransition();
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    finishTransition();
    choose('Yes');
    fireEvent.click(screen.getByRole('button', {name: /Finish/}));
    expect(onComplete).not.toHaveBeenCalled();
    finishTransition();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
