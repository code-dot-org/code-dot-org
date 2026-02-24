import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {FreeResponseCard} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/FreeResponseCard';

describe('FreeResponseCard', () => {
  const defaultItems = [
    'This is the first response.',
    'This is another excellent and thoughtful response.',
    'A third response.',
  ];

  const defaultProps = {
    title: 'What is your favorite part of the workshop?',
    tagText: 'Optional Question',
    items: defaultItems,
  };

  const renderComponent = (props = {}) => {
    return render(<FreeResponseCard {...defaultProps} {...props} />);
  };

  it('renders the title correctly', () => {
    renderComponent();
    expect(
      screen.getByText('What is your favorite part of the workshop?')
    ).toBeInTheDocument();
  });

  describe('when a tagText is provided', () => {
    it('renders the tag with the correct text', () => {
      renderComponent();
      expect(screen.getByText('Optional Question')).toBeInTheDocument();
    });
  });

  describe('when a tagText is not provided', () => {
    it('does not render a tag', () => {
      renderComponent({tagText: undefined});
      expect(screen.queryByText('Optional Question')).not.toBeInTheDocument();
    });
  });

  describe('when a list of items is provided', () => {
    it('renders each item in the list', () => {
      renderComponent();

      expect(
        screen.getByText('This is the first response.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('This is another excellent and thoughtful response.')
      ).toBeInTheDocument();
      expect(screen.getByText('A third response.')).toBeInTheDocument();
    });
  });

  describe('when the items array is empty', () => {
    it('renders the title but no response items', () => {
      renderComponent({items: []});

      expect(
        screen.getByText('What is your favorite part of the workshop?')
      ).toBeInTheDocument();

      expect(
        screen.queryByText('This is the first response.')
      ).not.toBeInTheDocument();
    });
  });
});
