import '@testing-library/jest-dom';
import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {Breakdown} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/types';
import {SelectCard} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/SelectCard';

describe('SelectCard', () => {
  const defaultItems: Breakdown[] = [
    {label: 'Option A', count: 15, percentage: 50},
    {label: 'Option B', count: 10, percentage: 33.3},
    {label: 'Option C', count: 5, percentage: 16.7},
  ];

  const defaultProps = {
    title: 'Test Select Card',
    description: 'This is a test description.',
    items: defaultItems,
    totalRespondents: 30,
    barLabel: 'responses',
  };

  const renderComponent = (props = {}) => {
    return render(<SelectCard {...defaultProps} {...props} />);
  };

  it('renders the title and description correctly', () => {
    renderComponent();
    expect(screen.getByText('Test Select Card')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  describe('when items are provided', () => {
    it('renders the label, count, and bar for each item', () => {
      renderComponent();

      // Verify content for the first item
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('15 responses')).toBeInTheDocument();

      // Verify content for the second item
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('10 responses')).toBeInTheDocument();
    });

    it('sets the correct width style for each percentage bar after animating', async () => {
      renderComponent();

      await waitFor(() => {
        const countElementA = screen.getByText('15 responses');
        const indicatorA =
          countElementA.parentElement?.querySelector('div[style]');
        expect(indicatorA).toHaveStyle('width: 50%');

        const countElementB = screen.getByText('10 responses');
        const indicatorB =
          countElementB.parentElement?.querySelector('div[style]');
        expect(indicatorB).toHaveStyle('width: 33.3%');
      });
    });

    it('handles a 0% width correctly after animating', async () => {
      const itemsWithZero = [{label: 'Zero Option', count: 0, percentage: 0}];
      renderComponent({items: itemsWithZero});

      await waitFor(() => {
        const countElement = screen.getByText('0 responses');
        const indicator =
          countElement?.parentElement?.querySelector('div[style]');
        expect(indicator).toHaveStyle('width: 0%');
      });
    });
  });

  describe('when barLabel is not provided', () => {
    it('renders only the count number without a label', () => {
      renderComponent({barLabel: undefined});

      // The text should just be the number, not "15 "
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.queryByText('15 responses')).not.toBeInTheDocument();
    });
  });

  describe('when there are no respondents', () => {
    it('does not render', () => {
      const {container} = renderComponent({totalRespondents: 0});

      expect(container.firstChild).toBeNull();
    });
  });
});
