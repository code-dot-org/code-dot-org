import React from 'react';

import i18n from '@cdo/locale';

// intro.js-react allows a string or a React element for the intro prop.
// Wrapping translator-supplied strings in a fragment sanitizes any HTML.
const sanitize = (unsafe: string) => <>{unsafe}</>;

export const SKILL_MAP_TOUR_STORAGE_KEY = 'adaptive-skill-map-tour-seen-v1';
export const SKILL_MAP_TOUR_INITIAL_STEP = 0;

export function buildSkillMapTourSteps(hasSkippedCheckpoints: boolean) {
  const steps = [
    {
      element: '#adaptive-tour-map',
      title: i18n.skillMapTourMapTitle(),
      intro: sanitize(i18n.skillMapTourMapText()),
    },
    {
      element: '#adaptive-tour-first-available',
      title: i18n.skillMapTourCheckpointTitle(),
      intro: sanitize(i18n.skillMapTourCheckpointText()),
    },
    {
      element: '#adaptive-tour-side',
      title: i18n.skillMapTourSideTitle(),
      intro: sanitize(i18n.skillMapTourSideText()),
    },
    {
      // No element: IntroJS floats this tooltip centered on the screen.
      // The Start button lives in CheckpointCard, which only mounts when a
      // checkpoint is focused — we explain the concept without requiring it.
      title: i18n.skillMapTourStartTitle(),
      intro: sanitize(i18n.skillMapTourStartText()),
    },
  ];

  if (hasSkippedCheckpoints) {
    steps.push({
      element: '#adaptive-tour-first-available',
      title: i18n.skillMapTourSkillCheckTitle(),
      intro: sanitize(i18n.skillMapTourSkillCheckText()),
    });
  }

  return steps;
}
