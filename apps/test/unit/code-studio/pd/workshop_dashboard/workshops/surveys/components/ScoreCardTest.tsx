import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {
  ScoreCard,
  CRITICAL_CONCERN_LIMIT,
  NEEDS_ATTENTION_LIMIT,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/ScoreCard';

// Mock the FontAwesomeV6Icon component to make it testable.
// It will render a span with the iconName as its text content.
jest.mock(
  '@code-dot-org/component-library/fontAwesomeV6Icon',
  () =>
    ({iconName}: {iconName: string}) =>
      <span>{iconName}</span>
);

describe('ScoreCard', () => {
  const defaultProps = {
    title: 'Test Score Card',
    description: 'This is a test description',
    footer: 'Test footer information',
    score: 85,
    responseCount: 10,
    minResponseCount: 5,
  };

  const renderComponent = (props = {}) => {
    return render(<ScoreCard {...defaultProps} {...props} />);
  };

  it('renders all basic text elements correctly', () => {
    renderComponent();
    expect(screen.getByText('Test Score Card')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    expect(screen.getByText('Test footer information')).toBeInTheDocument();
  });

  describe('when a numeric score is shown', () => {
    it.each([
      {score: CRITICAL_CONCERN_LIMIT - 1, status: 'criticalConcern'},
      {score: 0, status: 'criticalConcern'},
      {score: CRITICAL_CONCERN_LIMIT, status: 'needsAttention'},
      {score: NEEDS_ATTENTION_LIMIT - 1, status: 'needsAttention'},
      {score: NEEDS_ATTENTION_LIMIT, status: 'good'},
      {score: 95, status: 'good'},
    ])(
      'displays score $score and sets status to "$status"',
      ({score, status}) => {
        renderComponent({score});

        const scoreElement = screen.getByText(score.toString());
        expect(scoreElement).toBeInTheDocument();

        // Find the container by looking for the closest ancestor with the data-status attribute.
        const scoreBox = scoreElement.closest('[data-status]');
        expect(scoreBox).toHaveAttribute('data-status', status);
      }
    );
  });

  describe('when a placeholder icon is shown', () => {
    it('shows a dash icon for no responses', () => {
      renderComponent({responseCount: 0});

      expect(screen.getByText('No responses received')).toBeInTheDocument();
      const iconElement = screen.getByText('dash');
      expect(iconElement).toBeInTheDocument();

      const scoreBox = iconElement.closest('[data-status]');
      expect(scoreBox).toHaveAttribute('data-status', 'insufficientData');
    });

    it('shows a question icon for a null score', () => {
      renderComponent({score: null});

      const iconElement = screen.getByText('question');
      expect(iconElement).toBeInTheDocument();

      const scoreBox = iconElement.closest('[data-status]');
      expect(scoreBox).toHaveAttribute('data-status', 'insufficientData');
    });

    it('shows a question icon for insufficient data', () => {
      renderComponent({responseCount: 3, minResponseCount: 5});

      expect(
        screen.getByText('Insufficient data (<5 responses)')
      ).toBeInTheDocument();
      const iconElement = screen.getByText('question');
      expect(iconElement).toBeInTheDocument();

      const scoreBox = iconElement.closest('[data-status]');
      expect(scoreBox).toHaveAttribute('data-status', 'insufficientData');
    });
  });
});
