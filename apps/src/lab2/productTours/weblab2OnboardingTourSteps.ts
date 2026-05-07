import {offset} from '@floating-ui/dom';
import {type StepOptions, type Tour} from 'shepherd.js';

import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import {resourcePanelInstructionsElementId} from '../views/components/Instructions/ResourcePanel/constants';

export const createWeblab2OnboardingTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'weblab2-welcome',
    title: 'Welcome to Web Lab',
    text: 'Web Lab is a place to make web apps using HTML, CSS and JavaScript.',
    buttons: [nextButton(tour)],
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
  {
    id: 'resource-panel',
    attachTo: {
      element: `#${resourcePanelInstructionsElementId}`,
      on: 'right',
    },
    title: 'Resource Panel',
    text: 'On the left is the Resource Panel where you can find support. AI Tutor, Documentation, and guided flows like this can all be found in this panel. Switch tabs to go between the resources.',
    buttons: [backButton(tour), nextButton(tour)],
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
  {
    id: 'workspace',
    attachTo: {
      element: '#editor-preview-container',
      on: 'left',
    },
    title: 'Code & Preview Areas',
    text: 'On the right are your Code and Preview areas. You can choose to have Code, Preview or Split view open. Try going to Split mode to start.',
    buttons: [backButton(tour), nextButton(tour)],
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
  {
    id: 'add-file',
    attachTo: {
      element: '#uitest-files-plus',
      on: 'bottom',
    },
    title: 'Add file',
    text: 'You can add many different types of files to your project, including images, code files, and markdown or text files.',
    buttons: [backButton(tour), doneButton(tour)],
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
];
