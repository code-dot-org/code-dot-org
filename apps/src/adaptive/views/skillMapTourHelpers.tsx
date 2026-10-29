import React from 'react';

export const SKILL_MAP_TOUR_STORAGE_KEY = 'adaptive-skill-map-tour-seen-v1';
export const SKILL_MAP_TOUR_INITIAL_STEP = 0;

export function buildSkillMapTourSteps(hasSkippedCheckpoints: boolean) {
  const steps = [
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
    {
      element: '#adaptive-tour-map-canvas',
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
    },
  ];

  if (hasSkippedCheckpoints) {
    steps.push({
      element: '#adaptive-tour-first-available',
      title: 'Skill Checks',
      intro: (
        <>
          Checkpoints with a lightbulb badge are Skill Checks. You may already
          know this material and can skip ahead.
        </>
      ),
    });
  }

  return steps;
}
