import {type StepOptions, type StepOptionsButton, type Tour} from 'shepherd.js';

export const SKILL_MAP_TOUR_STORAGE_KEY = 'adaptive-skill-map-tour-seen-v1';
export const SKILL_MAP_TOUR_INITIAL_STEP = 0;

export function getSkillMapTourStepIndices(hasSkippedCheckpoints: boolean) {
  return {
    /** Step where the user picks a checkpoint by clicking the map. */
    pickCheckpoint: hasSkippedCheckpoints ? 3 : 2,
    /** Sidebar step — user ends the tour by clicking Start. */
    sidebar: hasSkippedCheckpoints ? 4 : 3,
  };
}

function gotItButton(tour: Tour): StepOptionsButton {
  return {
    text: 'Got it',
    action: () => tour.next(),
    classes: 'custom-shepherd-button-primary',
  };
}

export function buildSkillMapTourSteps(
  tour: Tour,
  hasSkippedCheckpoints: boolean
): StepOptions[] {
  const steps: StepOptions[] = [
    {
      id: 'skill-map',
      title: 'This is your skill map',
      text: 'Each circle is a checkpoint. Finish one and the checkpoints connected to it unlock.',
      attachTo: {element: '#adaptive-tour-map-canvas', on: 'right'},
      buttons: [gotItButton(tour)],
    },
    {
      id: 'first-checkpoint',
      title: 'You started here',
      text: 'Now you can pick your own path and choose what you want to learn next.',
      attachTo: {element: '#adaptive-tour-first-checkpoint', on: 'bottom'},
      buttons: [gotItButton(tour)],
    },
  ];

  if (hasSkippedCheckpoints) {
    steps.push({
      id: 'skill-check',
      title: 'Skill Check',
      text: 'You proved you already know these skills, so you can skip any checkpoint with a lightbulb badge.',
      attachTo: {element: '#adaptive-tour-first-available', on: 'bottom'},
      buttons: [gotItButton(tour)],
    });
  }

  steps.push(
    {
      id: 'available-checkpoints',
      title: 'Available checkpoints',
      // No button — a map click advances.
      text: 'Start with any of the unlocked checkpoints. Click one to learn more about it.',
      attachTo: {element: '#adaptive-tour-map', on: 'right'},
      buttons: [],
    },
    {
      id: 'checkpoint-details',
      title: 'Checkpoint details',
      // No button — the Start button in CheckpointCard dismisses the tour.
      text: "<p>See what you'll learn, how long it takes, and what to finish first.</p><p>Ready? Click Start! You can come back to the skill map anytime to pick a different checkpoint.</p>",
      attachTo: {element: '#adaptive-tour-side', on: 'left'},
      buttons: [],
    }
  );

  return steps;
}
