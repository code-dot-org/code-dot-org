import Shepherd, {
  StepOptions,
  type StepOptionsButton,
  type Tour,
} from 'shepherd.js';

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

export const backButton = (tour: Tour): StepOptionsButton => ({
  text: 'Back',
  action: () => tour.back(),
  classes: 'custom-shepherd-button-secondary',
});

export const createTourWithSteps = (
  getSteps: (tour: Tour) => StepOptions[],
  additionalStepOptions?: StepOptions
) => {
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
