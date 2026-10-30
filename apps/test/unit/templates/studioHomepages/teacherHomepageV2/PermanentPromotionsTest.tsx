import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import PermanentPromotions from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/PermanentPromotions';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

describe('PermanentPromotions', () => {
  const permanentPromotion = {
    id: 'explore-pl',
    title: 'Grow your knowledge',
    description:
      'Empower your teaching with workshops and self-paced learning.',
    buttonLabel: 'Explore professional learning',
    buttonTarget: '/my-professional-learning',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    render(<PermanentPromotions />);
  });

  it('renders the first promotion with correct title, description, and link', () => {
    expect(screen.getByText(permanentPromotion.title)).toBeInTheDocument();
    expect(
      screen.getByText(permanentPromotion.description)
    ).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: permanentPromotion.buttonLabel,
    });
    expect(link).toHaveAttribute('href', permanentPromotion.buttonTarget);
  });

  it('tracks when the promotion link is clicked', () => {
    fireEvent.click(
      screen.getByRole('link', {name: permanentPromotion.buttonLabel})
    );

    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      EVENTS.PERMANENT_PROMOTION_CLICKED,
      {id: permanentPromotion.id}
    );
  });
});
