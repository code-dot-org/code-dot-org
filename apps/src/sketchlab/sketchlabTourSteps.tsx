import {type StepOptions, type Tour} from 'shepherd.js';

import {resourcePanelNavigationButtonElementId} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

export const createSketchlabTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'canvas-overview',
    attachTo: {element: '.react-flow', on: 'bottom'},
    title: 'Flow Canvas',
    text: 'This is your canvas where you can create and connect nodes. Drag nodes from the sidebar on the right, and connect them by dragging from one handle to another.',
    buttons: [nextButton(tour)],
  },
  {
    id: 'sidebar',
    attachTo: {element: '.react-flow + aside, aside', on: 'left'},
    title: 'Node Palette',
    text: 'Drag node types from this sidebar onto the canvas. You can add Text, AI, Condition, Web, and Result nodes.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'controls',
    attachTo: {element: '.react-flow__controls', on: 'top'},
    title: 'Canvas Controls',
    text: 'Use these controls to zoom in, zoom out, and fit the view to your nodes.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'navigation',
    attachTo: {
      element: `#${resourcePanelNavigationButtonElementId}`,
      on: 'top',
    },
    title: 'Move on to the next level',
    text: "When you're done with your sketch, click Continue to move on to the next level.",
    buttons: [backButton(tour), doneButton(tour)],
  },
];
