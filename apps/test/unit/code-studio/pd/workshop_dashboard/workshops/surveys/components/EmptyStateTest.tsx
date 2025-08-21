import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {EmptyState} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/EmptyState';

describe('EmptyState', () => {
  const defaultProps = {
    imageProps: {
      src: 'path/to/image.png',
      // Note: No alt text here to test the default case.
    },
    title: 'No Data Available',
    description: 'There are no responses to display for this question yet.',
  };

  const renderComponent = (props = {}) => {
    return render(<EmptyState {...defaultProps} {...props} />);
  };

  it('renders the title and description', () => {
    renderComponent();

    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There are no responses to display for this question yet.'
      )
    ).toBeInTheDocument();
  });

  describe('image rendering', () => {
    it('renders a decorative image with an empty alt attribute by default', () => {
      renderComponent();

      // Find the image by its role. Since the alt text is empty,
      // it has no accessible name.
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'path/to/image.png');
      expect(image).toHaveAttribute('alt', '');
    });

    it('allows overriding the alt attribute for an informative image', () => {
      renderComponent({
        imageProps: {
          src: 'path/to/image.png',
          alt: 'An informative description.', // Provide an explicit alt text
        },
      });

      // Find the image by its accessible name (the alt text).
      const image = screen.getByRole('img', {
        name: 'An informative description.',
      });
      expect(image).toBeInTheDocument();
    });
  });
});
