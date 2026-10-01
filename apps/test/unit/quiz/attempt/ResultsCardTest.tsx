import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ResultsCard, {
  ResultsCardProps,
} from '@cdo/apps/quiz/attempt/ResultsCard';

const renderCard = (props: Partial<ResultsCardProps> = {}) =>
  render(
    <ResultsCard
      title="Unit 3 Assessment"
      showCorrectness
      score={2}
      maxScore={3}
      attemptNumber={1}
      allowMultipleAttempts={false}
      canRetake={false}
      submittedAt="2026-09-05T14:14:00Z"
      onTryAgain={jest.fn()}
      onNextLevel={jest.fn()}
      {...props}
    />
  );

describe('ResultsCard', () => {
  it('shows the score percentage and attempt stats under a "results" label', () => {
    renderCard();

    expect(screen.getByText('results')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('2 of 3 Correct')).toBeInTheDocument();
    expect(screen.getByText('Attempt #1')).toBeInTheDocument();
    expect(screen.getByText(/^Submitted /)).toBeInTheDocument();
  });

  it('shows an em dash for the percentage when there are no auto-graded questions', () => {
    renderCard({score: null, maxScore: null});
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows only Next level when the attempt cannot be retaken', () => {
    renderCard({canRetake: false});

    expect(
      screen.queryByRole('button', {name: 'Try again'})
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Next level/})
    ).toBeInTheDocument();
  });

  it('adds Try again alongside Next level when the attempt can be retaken', () => {
    renderCard({canRetake: true});
    expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument();
  });

  describe('showCorrectness off', () => {
    it('hides the score stat and shows a "submitted" label instead of "results"', () => {
      renderCard({showCorrectness: false});

      expect(screen.getByText('submitted')).toBeInTheDocument();
      expect(screen.queryByText('67%')).not.toBeInTheDocument();
      expect(screen.queryByText('2 of 3 Correct')).not.toBeInTheDocument();
      expect(screen.getByText(/^Submitted /)).toBeInTheDocument();
    });

    it('still shows the attempt stat and actions', () => {
      renderCard({showCorrectness: false, canRetake: true});

      expect(screen.getByText('Attempt #1')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Try again'})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /Next level/})
      ).toBeInTheDocument();
    });
  });
});
