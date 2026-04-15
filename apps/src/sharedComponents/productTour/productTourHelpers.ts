import Shepherd, {
  type StepOptions,
  type StepOptionsButton,
  type Tour,
} from 'shepherd.js';

import {navigateToHref} from '@cdo/apps/utils';

export const nextButton = (tour: Tour): StepOptionsButton => ({
  text: 'Next',
  action: () => tour.next(),
  classes: 'custom-shepherd-button-primary',
});

export const doneButton = (tour: Tour): StepOptionsButton => ({
  text: 'Done',
  action: () => tour.complete(),
  classes: 'custom-shepherd-button-primary',
});

export const completeButton = (tour: Tour): StepOptionsButton => ({
  text: 'Complete Lesson',
  action: () => tour.complete(),
  classes: 'custom-shepherd-button-primary',
});

export const backButton = (tour: Tour): StepOptionsButton => ({
  text: 'Back',
  action: () => tour.back(),
  classes: 'custom-shepherd-button-secondary',
});

// Creates a reusable completion step for onboarding tours.
// Renders centered (no attachTo), shows a celebration emoji, the tour name,
// and two buttons: stay on the current page or return to the home page.
export const createCompletionStep = (
  tour: Tour,
  tourName: string,
  stayButtonLabel: string
): StepOptions => ({
  id: 'onboarding-complete',
  classes: 'custom-shepherd-onboarding-container onboarding-completion-step',
  text: `
    <div class="onboarding-completion-content">
      <span class="onboarding-completion-emoji">🎉</span>
      <strong>Great work!</strong>
      <p>You've completed the ${tourName} lesson.</p>
    </div>
  `,
  buttons: [
    {
      text: stayButtonLabel,
      action: () => tour.complete(),
      classes: 'custom-shepherd-button-primary',
    },
    {
      text: 'Return to Home page',
      action: () => {
        tour.complete();
        navigateToHref('/teacher_dashboard/home');
      },
      classes: 'custom-shepherd-button-secondary',
    },
  ],
});

export const createTourWithSteps = (
  getSteps: (tour: Tour) => StepOptions[],
  additionalStepOptions?: Partial<StepOptions>
): Tour => {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true,
    defaultStepOptions: {
      cancelIcon: {enabled: true},
      scrollTo: true,
      classes: 'custom-shepherd-step-container',
      ...(additionalStepOptions ?? {}),
    },
  });
  tour.addSteps(getSteps(tour));
  return tour;
};
