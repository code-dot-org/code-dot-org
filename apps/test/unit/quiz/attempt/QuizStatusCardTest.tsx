import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizStatusCard, {
  QuizStatusCardProps,
} from '@cdo/apps/quiz/attempt/QuizStatusCard';

const renderCard = (props: Partial<QuizStatusCardProps> = {}) =>
  render(
    <QuizStatusCard
      title="Unit 3 Assessment"
      questionCount={3}
      allowMultipleAttempts
      onBegin={jest.fn()}
      {...props}
    />
  );

describe('QuizStatusCard', () => {
  it('renders the title as an h2 under the "Before you begin" label', () => {
    renderCard();

    expect(screen.getByText('Before you begin')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Unit 3 Assessment', level: 2})
    ).toBeInTheDocument();
  });

  it('renders the intro text when given', () => {
    renderCard({introText: 'Practice what you learned.'});

    expect(screen.getByText('Practice what you learned.')).toBeInTheDocument();
  });

  it('pluralizes the question count', () => {
    const {rerender} = renderCard({questionCount: 1});
    expect(screen.getByText('1 question')).toBeInTheDocument();

    rerender(
      <QuizStatusCard
        title="Unit 3 Assessment"
        questionCount={3}
        allowMultipleAttempts
        onBegin={jest.fn()}
      />
    );
    expect(screen.getByText('3 questions')).toBeInTheDocument();
  });

  it('shows the time limit only for a timed quiz', () => {
    const {rerender} = renderCard();
    expect(screen.queryByText(/minute/)).not.toBeInTheDocument();

    rerender(
      <QuizStatusCard
        title="Unit 3 Assessment"
        questionCount={3}
        timeLimitMinutes={15}
        allowMultipleAttempts
        onBegin={jest.fn()}
      />
    );
    expect(screen.getByText('15 minutes')).toBeInTheDocument();
  });

  it('describes the attempt allowance', () => {
    const {rerender} = renderCard({allowMultipleAttempts: true});
    expect(screen.getByText('Unlimited attempts')).toBeInTheDocument();

    rerender(
      <QuizStatusCard
        title="Unit 3 Assessment"
        questionCount={3}
        allowMultipleAttempts={false}
        onBegin={jest.fn()}
      />
    );
    expect(screen.getByText('1 attempt')).toBeInTheDocument();
  });

  it('calls onBegin when Begin is clicked', () => {
    const onBegin = jest.fn();
    renderCard({onBegin});

    fireEvent.click(screen.getByRole('button', {name: 'Begin'}));

    expect(onBegin).toHaveBeenCalledTimes(1);
  });

  describe('submitted (no-correctness) variant', () => {
    it('shows a submitted stamp instead of the question count, under a "submitted" label', () => {
      renderCard({submittedAt: '2026-09-05T14:14:00Z', canRetake: false});

      expect(screen.getByText('submitted')).toBeInTheDocument();
      expect(screen.getByText(/^Submitted /)).toBeInTheDocument();
      expect(screen.queryByText(/question/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Begin'})
      ).not.toBeInTheDocument();
    });

    it('shows only Next level when the attempt cannot be retaken', () => {
      renderCard({
        submittedAt: '2026-09-05T14:14:00Z',
        canRetake: false,
        allowMultipleAttempts: false,
      });

      expect(screen.getByText('No attempts remaining')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Try again'})
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /Next level/})
      ).toBeInTheDocument();
    });

    it('adds Try again alongside Next level when the attempt can be retaken', () => {
      renderCard({
        submittedAt: '2026-09-05T14:14:00Z',
        canRetake: true,
        allowMultipleAttempts: true,
      });

      expect(screen.getByText('Unlimited attempts')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Try again'})
      ).toBeInTheDocument();
    });

    it('calls onTryAgain and onNextLevel from their respective buttons', () => {
      const onTryAgain = jest.fn();
      const onNextLevel = jest.fn();
      renderCard({
        submittedAt: '2026-09-05T14:14:00Z',
        canRetake: true,
        onTryAgain,
        onNextLevel,
      });

      fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
      fireEvent.click(screen.getByRole('button', {name: /Next level/}));

      expect(onTryAgain).toHaveBeenCalledTimes(1);
      expect(onNextLevel).toHaveBeenCalledTimes(1);
    });
  });
});
