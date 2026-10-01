import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {
  MultipleChoiceQuestion,
  QuestionsStep as Step,
} from '@cdo/apps/adaptive/types';
import QuestionsStep from '@cdo/apps/adaptive/views/steps/QuestionsStep';
import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';

const mockDispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppDispatch: () => mockDispatch,
}));

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
    {id: 'a', text: `Right ${id}`},
    {id: 'b', text: `Wrong ${id}`},
  ],
  correctChoiceId: 'a',
  page,
});

const step: Step = {
  id: 'quiz',
  title: 'Quick questions',
  kind: 'questions',
  showCorrectness: true,
  questions: [
    question(1, 1, 'First question'),
    question(2, 2, 'Second question'),
  ],
};

// Holds attempts as PathwayApp does, so saves feed back in.
function renderStep(initial: QuizAttemptData[] = []) {
  const onComplete = jest.fn();
  const saved: QuizAttemptData[][] = [];
  const Host = () => {
    const [attempts, setAttempts] = useState(initial);
    return (
      <QuestionsStep
        step={step}
        attempts={attempts}
        onSaveAttempts={list => {
          saved.push(list);
          setAttempts(list);
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
  beforeEach(() => mockDispatch.mockClear());

  it('shows the questions page by page, as a quiz level does', async () => {
    renderStep();
    expect(await screen.findByText('First question')).toBeInTheDocument();
    expect(screen.queryByText('Second question')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Next/}));
    expect(screen.getByText('Second question')).toBeInTheDocument();
  });

  it('scores the attempt and finishes the step from the results', async () => {
    const {onComplete, saved} = renderStep();
    fireEvent.click(await screen.findByRole('radio', {name: /Right 1/}));
    fireEvent.click(screen.getByRole('button', {name: /Next/}));
    fireEvent.click(screen.getByRole('radio', {name: /Wrong 2/}));
    fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

    expect(await screen.findByText('1 of 2 Correct')).toBeInTheDocument();
    expect(saved[saved.length - 1][0]).toMatchObject({score: 1, maxScore: 2});
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows the results of a submitted attempt on re-entry', () => {
    renderStep([
      {
        id: 1,
        attemptNumber: 1,
        submittedAt: '2026-10-01T00:00:00.000Z',
        score: 2,
        maxScore: 2,
        expiresAt: null,
        canRetake: false,
      },
    ]);
    expect(screen.getByText('2 of 2 Correct')).toBeInTheDocument();
  });

  it('restores the selections of an open attempt on re-entry', () => {
    renderStep([
      {
        id: 1,
        attemptNumber: 1,
        submittedAt: null,
        score: null,
        maxScore: null,
        expiresAt: null,
        canRetake: false,
        questionResultsInProgress: [{quizQuestionId: 1, selectedChoiceId: 'b'}],
      },
    ]);
    expect(screen.getByRole('radio', {name: /Wrong 1/})).toBeChecked();
  });

  it('keeps a selection when it is saved', async () => {
    const {saved} = renderStep();
    fireEvent.click(await screen.findByRole('radio', {name: /Wrong 1/}));
    await waitFor(() =>
      expect(saved[saved.length - 1][0].questionResultsInProgress).toEqual([
        {quizQuestionId: 1, selectedChoiceId: 'b'},
      ])
    );
    expect(screen.getByRole('radio', {name: /Wrong 1/})).toBeChecked();
  });
});
