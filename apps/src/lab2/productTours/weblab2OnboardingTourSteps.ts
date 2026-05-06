import {type StepOptions, type Tour} from 'shepherd.js';

import {
  backButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import {resourcePanelInstructionsElementId} from '../views/components/Instructions/ResourcePanel/constants';

export const createWeblab2OnboardingTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'weblab2-welcome',
    attachTo: {
      element: '#lab2-weblab2',
      on: 'right',
    },
    title: 'Welcome to Web Lab',
    text: 'Web Lab is a place to make web apps using HTML, CSS and JavaScript.',
    buttons: [nextButton(tour)],
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
  },
  {
    id: 'workspace',
    attachTo: {
      element: '#workspace',
      on: 'left',
    },
    title: 'Code & Preview Areas',
    text: 'On the right are your Code and Preview areas. You can choose to have Code, Preview or Split view open. Try going to Split mode to start.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'add-file',
    attachTo: {
      element: '#uitest-files-plus',
      on: 'left',
    },
    title: 'Add file',
    text: 'You can add many different types of files to your project, including images, code files, and markdown or text files. Click the add file button to continue.',
    advanceOn: {
      selector: '#uitest-files-plus',
      event: 'click',
    },
    buttons: [backButton(tour)],
  },
];
