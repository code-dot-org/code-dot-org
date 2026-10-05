import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {StepAnswers} from '@cdo/apps/adaptive/progress';
import {
  MultipleChoiceQuestion,
  QuestionsStep as Step,
} from '@cdo/apps/adaptive/types';
import QuestionsStep from '@cdo/apps/adaptive/views/steps/QuestionsStep';

const question = (
  id: number,
  page: number,
  stem: string
): MultipleChoiceQuestion => ({
  id,
  type: 'MultipleChoiceQuestion',
  questionName: `q${id}`,
  stem,
  choices: [
    {id: 'a', text: `Yes ${id}`},
    {id: 'b', text: `No ${id}`},
  ],
  page,
});

const step: Step = {
  id: 'survey',
  title: 'Quick questions',
  description: 'Tell us about yourself.',
  kind: 'questions',
  questions: [
    question(1, 1, 'First question'),
    question(2, 2, 'Second question'),
  ],
};

const gradedStep: Step = {
  ...step,
  questions: [
    {...question(1, 1, 'Graded question'), correctChoiceId: 'a'},
    question(2, 2, 'Second question'),
  ],
};

// Holds answers as PathwayApp does, so selections feed back in.
function renderStep(initial: StepAnswers = {}, content: Step = step) {
  const onComplete = jest.fn();
  const saved: [number, string][] = [];
  const Host = () => {
    const [answers, setAnswers] = useState(initial);
    return (
      <QuestionsStep
        step={content}
        answers={answers}
        onSelectChoice={(questionId, choiceId) => {
          saved.push([questionId, choiceId]);
          setAnswers(prev => ({
            ...prev,
            [questionId]: [...(prev[questionId] ?? []), choiceId],
          }));
        }}
        onComplete={onComplete}
      />
    );
  };
  render(<Host />);
  return {onComplete, saved};
}

describe('QuestionsStep', () => {
  it('shows the title card and questions page by page', () => {
    renderStep();
    expect(screen.getByText('Quick questions')).toBeInTheDocument();
    expect(screen.getByText('Tell us about yourself.')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.queryByText('Second question')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Go to page/})
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
    fireEvent.click(screen.getByRole('button', {name: /Next/}));
    expect(screen.getByText('Second question')).toBeInTheDocument();
    expect(screen.queryByText('Quick questions')).not.toBeInTheDocument();
  });

  it('numbers questions in the order they are shown', () => {
    renderStep(
      {},
      {
        ...step,
        questions: [
          question(1, 2, 'Later question'),
          question(2, 1, 'Earlier question'),
        ],
      }
    );
    expect(screen.getByText('Earlier question')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', {name: /Yes 2/}));
    fireEvent.click(screen.getByRole('button', {name: /Next/}));
    expect(screen.getByText('Later question')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
  });

  it('saves each selection', () => {
    const {saved} = renderStep();
    fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
    expect(saved).toEqual([[1, 'b']]);
    expect(screen.getByRole('radio', {name: /No 1/})).toBeChecked();
  });

  it('restores the latest saved pick', () => {
    renderStep({1: ['b', 'a']});
    expect(screen.getByRole('radio', {name: /Yes 1/})).toBeChecked();
  });

  it('enables Next and Submit once the page is answered', () => {
    const {onComplete} = renderStep();
    const nextButton = screen.getByRole('button', {name: /Next/});
    expect(nextButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);

    const submitButton = screen.getByRole('button', {name: 'Submit'});
    expect(submitButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', {name: /Yes 2/}));
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  describe('with a graded question', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('keeps a wrong answer on the page until it is corrected', () => {
      renderStep({}, gradedStep);
      fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      expect(screen.getByText('Not quite. Try again.')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.queryByText('Second question')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      expect(
        screen.queryByText('Not quite. Try again.')
      ).not.toBeInTheDocument();
    });

    it('shows Correct! and then moves on', () => {
      const {saved} = renderStep({}, gradedStep);
      fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      // Still focusable, so keyboard focus is not lost during the pause.
      const nextButton = screen.getByRole('button', {name: /Next/});
      expect(nextButton).toBeEnabled();
      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(nextButton);

      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(saved).toEqual([
        [1, 'b'],
        [1, 'a'],
      ]);
    });
  });
});
