import {fireEvent, render, screen} from '@testing-library/react';
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

// Holds answers as PathwayApp does, so selections feed back in.
function renderStep(initial: StepAnswers = {}) {
  const onComplete = jest.fn();
  const saved: [number, string][] = [];
  const Host = () => {
    const [answers, setAnswers] = useState(initial);
    return (
      <QuestionsStep
        step={step}
        answers={answers}
        onSelectChoice={(questionId, choiceId) => {
          saved.push([questionId, choiceId]);
          setAnswers(prev => ({
            ...prev,
            [questionId]: [...(prev[questionId] ?? []), choiceId],
          }));
        }}
        continueLabel="Continue"
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

    fireEvent.click(screen.getByRole('button', {name: /Next/}));
    expect(screen.getByText('Second question')).toBeInTheDocument();
    expect(screen.queryByText('Quick questions')).not.toBeInTheDocument();
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

  it('enables Continue only once every question is answered', () => {
    const {onComplete} = renderStep();
    fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
    fireEvent.click(screen.getByRole('button', {name: /Next/}));
    const continueButton = screen.getByRole('button', {name: 'Continue'});
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', {name: /Yes 2/}));
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
