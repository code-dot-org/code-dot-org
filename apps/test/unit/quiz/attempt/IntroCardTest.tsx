import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import IntroCard, {IntroCardProps} from '@cdo/apps/quiz/attempt/IntroCard';

const renderCard = (props: Partial<IntroCardProps> = {}) =>
  render(
    <IntroCard
      title="Unit 3 Assessment"
      questionCount={3}
      allowMultipleAttempts
      onBegin={jest.fn()}
      {...props}
    />
  );

describe('IntroCard', () => {
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
      <IntroCard
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
      <IntroCard
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
      <IntroCard
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
});
