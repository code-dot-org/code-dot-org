import {type StepOptionsButton, type Tour} from 'shepherd.js';

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
