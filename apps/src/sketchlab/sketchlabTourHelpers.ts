// import sketchlabI18n from '@cdo/apps/lab2/locale';

// import {SKETCHLAB_ONBOARDING_TOUR_SEEN} from './constants';
export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: 'label.ToolIcon[title^="Selection"]', // Selects by title attribute
    title: 'Move and select',
    intro:
      'Use the hand tool to pan around the canvas. Switch to the pointer to select or drag multiple elements.',
  },
  {
    element: 'label.ToolIcon[title^="Hand"]', // Selects by title attribute
    title: 'Rectangle',
    intro:
      'Use the hand tool to pan around the canvas. Switch to the pointer to select or drag multiple elements.',
  },
];
