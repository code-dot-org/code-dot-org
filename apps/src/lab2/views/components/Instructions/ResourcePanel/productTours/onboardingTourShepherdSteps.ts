import {offset} from '@floating-ui/dom';
import {type StepOptions, type Tour} from 'shepherd.js';

import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {
  nextButton,
  backButton,
  doneButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

export const createOnboardingTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'instructions',
    attachTo: {
      element: `#${resourcePanelInstructionsElementId}`,
      on: 'right',
    },
    title: 'Resource area',
    text: 'All your helpful resources can be found in the resource area.',
    buttons: [nextButton(tour)],
  },
  {
    id: 'tabs',
    attachTo: {element: `#${resourcePanelTabsElementId}`, on: 'right'},
    title: 'Resource tabs',
    text: 'There are tabs for each of the resources you need while working on a level including Instructions, Validation and Version History.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'links',
    attachTo: {element: `#${resourcePanelLinksElementId}`, on: 'right'},
    title: 'Extra links',
    text: "Here is where you'll find links to documentation and lab settings including light/dark and font size.",
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'navigation',
    attachTo: {
      element: `#${resourcePanelNavigationButtonElementId}`,
      on: 'top',
    },
    title: 'Finish level',
    text: 'The button that allows you to submit or move to the next level can always be found at the bottom of the resource area. It will be disabled if you need to do more work to complete the level.',
    buttons: [backButton(tour), doneButton(tour)],
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
];
