import {render, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import PermanentPromotions from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/PermanentPromotions';

describe('PermanentPromotions', () => {
  beforeEach(() => {
    render(<PermanentPromotions />);
  });

  it('renders the first promotion with correct title, description, and link', () => {
    expect(screen.getByText('Grow your knowledge')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Empower your teaching with workshops and self-paced learning.',
      ),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: 'Explore professional learning',
    });
    expect(link).toHaveAttribute('href', '/my-professional-learning');
  });
});
