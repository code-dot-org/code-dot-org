import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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
    pickCheckpoint: hasSkippedCheckpoints ? 2 : 1,
    /** Sidebar step — user ends the tour by clicking Start. */
    sidebar: hasSkippedCheckpoints ? 3 : 2,
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
      title: 'Your skill map',
      intro: (
        <>
          Each circle is a checkpoint. Finish one and the connected ones unlock.
        </>
      ),
    },
  ];

  if (hasSkippedCheckpoints) {
    steps.push({
      element: '#adaptive-tour-first-available',
      title: 'Skill Checks',
      intro: (
        <>
          Checkpoints marked with <FontAwesomeV6Icon iconName="forward" /> are
          Skill Checks. You may already know this material and can skip ahead.
        </>
      ),
    });
  }

  steps.push(
    {
      element: '#adaptive-tour-map',
      title: 'Open checkpoints',
      intro: <>Tap any highlighted checkpoint to learn what it covers.</>,
    },
    {
      element: '#adaptive-tour-side',
      title: 'Checkpoint details',
      intro: (
        <>
          Here you can see what you'll learn, how long it takes, and any
          prereqs. When you're ready, hit Start — you can come back to pick a
          different checkpoint any time.
        </>
      ),
    }
  );

  return steps;
}
