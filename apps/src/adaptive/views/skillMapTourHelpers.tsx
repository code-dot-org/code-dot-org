import React from 'react';

export const SKILL_MAP_TOUR_STORAGE_KEY = 'adaptive-skill-map-tour-seen-v1';
export const SKILL_MAP_TOUR_INITIAL_STEP = 0;

/**
 * Step indices for the interactive tour steps. These shift by one when the
 * Skill Checks step is present so MapScreen doesn't hardcode numbers.
 */
export function getSkillMapTourStepIndices(hasSkippedCheckpoints: boolean) {
  return {
    /** Step where the user picks a checkpoint by clicking the map. */
    pickCheckpoint: hasSkippedCheckpoints ? 3 : 2,
    /** Sidebar step — user ends the tour by clicking Start. */
    sidebar: hasSkippedCheckpoints ? 4 : 3,
  };
}

interface TourStep {
  element: string;
  position?: string;
  title: string;
  intro: React.JSX.Element;
}

export function buildSkillMapTourSteps(hasSkippedCheckpoints: boolean) {
  const steps: TourStep[] = [
    {
      element: '#adaptive-tour-map-canvas',
      position: 'right',
      title: 'This is your skill map',
      intro: (
        <>
          Each circle is a checkpoint. Finish one and the checkpoints connected
          to it unlock.
        </>
      ),
    },
    {
      element: '#adaptive-tour-first-checkpoint',
      title: 'You started here',
      intro: (
        <>
          Now you can pick your own path and choose what you want to learn next.
        </>
      ),
    },
  ];

  if (hasSkippedCheckpoints) {
    steps.push({
      element: '#adaptive-tour-first-available',
      title: 'Skill Check',
      intro: (
        <>
          You proved you already know these skills, so you can skip any
          checkpoint with a lightbulb badge.
        </>
      ),
    });
  }

  steps.push(
    {
      element: '#adaptive-tour-map',
      title: 'Available checkpoints',
      intro: (
        <>
          Start with any of the unlocked checkpoints. Click one to learn more
          about it.
        </>
      ),
    },
    {
      element: '#adaptive-tour-side',
      title: 'Checkpoint details',
      intro: (
        <>
          <p>
            See what you&apos;ll learn, how long it takes, and what to finish
            first.
          </p>
          <p>
            Ready? Click Start! You can come back to the skill map anytime to
            pick a different checkpoint.
          </p>
        </>
      ),
    }
  );

  return steps;
}
