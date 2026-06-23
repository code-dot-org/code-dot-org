import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Tour} from 'shepherd.js';

import OnboardingChecklist from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/OnboardingChecklist';

// A Tour exposes many methods; the checklist only ever calls start(), so we
// stub just that and cast through unknown.
const fakeTour = () => ({start: jest.fn()} as unknown as Tour);

describe('OnboardingChecklist', () => {
  function renderComponent(
    overrides: Partial<React.ComponentProps<typeof OnboardingChecklist>> = {}
  ) {
    const props = {
      createSectionTour: fakeTour(),
      reviewSyllabusTour: fakeTour(),
      learnHowToEvaluateTour: fakeTour(),
      demoType: 'high' as const,
      isHidden: false,
      onHide: jest.fn(),
      ...overrides,
    };
    return {props, ...render(<OnboardingChecklist {...props} />)};
  }

  it('renders the checklist items when not hidden', () => {
    renderComponent();

    expect(screen.queryByText('Where should we start?')).not.toBeNull();
    expect(screen.queryByText('Review the syllabus')).not.toBeNull();
    expect(screen.queryByText('Learn how to evaluate')).not.toBeNull();
    expect(screen.queryByText('Create a class section')).not.toBeNull();
  });

  it('renders nothing when hidden', () => {
    const {container} = renderComponent({isHidden: true});

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Where should we start?')).toBeNull();
  });

  it('calls onHide when the hide button is clicked', () => {
    const {props} = renderComponent();

    fireEvent.click(screen.getByText('Hide onboarding'));

    expect(props.onHide).toHaveBeenCalledTimes(1);
  });

  it('starts the matching tour when a checklist item is clicked', () => {
    const {props} = renderComponent();

    fireEvent.click(screen.getByText('Create a class section'));
    expect(props.createSectionTour?.start).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Review the syllabus'));
    expect(props.reviewSyllabusTour?.start).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Learn how to evaluate'));
    expect(props.learnHowToEvaluateTour?.start).toHaveBeenCalledTimes(1);
  });
});
