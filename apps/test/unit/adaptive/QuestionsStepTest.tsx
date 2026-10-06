import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {Answer, StepAnswers} from '@cdo/apps/adaptive/progress';
import {
  MultipleChoiceQuestion,
  QuestionsStep as Step,
} from '@cdo/apps/adaptive/types';
import QuestionsStep from '@cdo/apps/adaptive/views/steps/QuestionsStep';

const question = (id: number, stem: string): MultipleChoiceQuestion => ({
  id,
  type: 'MultipleChoiceQuestion',
  questionName: `q${id}`,
  stem,
  choices: [
    {id: 'a', text: `Yes ${id}`},
    {id: 'b', text: `No ${id}`},
  ],
});

const step: Step = {
  id: 'survey',
  title: 'Quick questions',
  description: 'Tell us about yourself.',
  kind: 'questions',
  question: question(1, 'First question'),
};

const gradedStep: Step = {
  ...step,
  question: {...question(1, 'Graded question'), correctChoiceId: 'a'},
};

// Holds answers as PathwayApp does, so selections feed back in.
function renderStep(initial: StepAnswers = {}, content: Step = step) {
  const onComplete = jest.fn();
  const saved: [number, Answer[]][] = [];
  const Host = () => {
    const [answers, setAnswers] = useState(initial);
    return (
      <QuestionsStep
        step={content}
        answers={answers}
        onSaveAnswers={(questionId, list) => {
          saved.push([questionId, list]);
          setAnswers(prev => ({...prev, [questionId]: list}));
        }}
        onComplete={onComplete}
      />
    );
  };
  render(<Host />);
  return {onComplete, saved};
}

describe('QuestionsStep', () => {
  it('shows the title card and the question', () => {
    renderStep();
    expect(screen.getByText('Quick questions')).toBeInTheDocument();
    expect(screen.getByText('Tell us about yourself.')).toBeInTheDocument();
    expect(screen.getByText('First question')).toBeInTheDocument();
  });

  it('saves a survey answer on Submit, replacing the last one', () => {
    const {saved} = renderStep({1: [{answerId: 'a'}]});
    fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
    expect(saved).toEqual([]);
    expect(screen.getByRole('radio', {name: /No 1/})).toBeChecked();

    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(saved).toEqual([[1, [{answerId: 'b'}]]]);
  });

  it('restores the latest saved pick', () => {
    renderStep({
      1: [{answerId: 'b'}, {answerId: 'a'}],
    });
    expect(screen.getByRole('radio', {name: /Yes 1/})).toBeChecked();
  });

  it('enables Submit once the question is answered', () => {
    const {onComplete} = renderStep();
    const submitButton = screen.getByRole('button', {name: 'Submit'});
    expect(submitButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  describe('with a graded question', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('keeps a wrong answer on screen until it is corrected', () => {
      const {onComplete} = renderStep({}, gradedStep);
      fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(screen.getByText('Not quite. Try again.')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      act(() => {
        jest.runAllTimers();
      });
      expect(onComplete).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      expect(
        screen.queryByText('Not quite. Try again.')
      ).not.toBeInTheDocument();
    });

    it('shows Correct! and then completes the step', () => {
      const {onComplete, saved} = renderStep({}, gradedStep);
      fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      // Still focusable, so keyboard focus is not lost during the pause.
      const submitButton = screen.getByRole('button', {name: 'Submit'});
      expect(submitButton).toBeEnabled();
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(submitButton);
      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        jest.runAllTimers();
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
      const wrong = {answerId: 'b', isCorrect: false};
      const right = {answerId: 'a', isCorrect: true};
      expect(saved).toEqual([
        [1, [wrong]],
        [1, [wrong, right]],
      ]);
    });
  });
});
