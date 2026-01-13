import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
} from './constants';
export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: `#${resourcePanelInstructionsElementId}`,
    title: 'Resource area',
    intro:
      'All your helpful resources can be found in the resource area. When starting a level it will always show the instructions tab first.',
  },
  {
    element: `#${resourcePanelTabsElementId}`,
    title: 'Resource tabs',
    intro:
      'There are tabs for each of the resources you need while working on a level including Instructions, Validation and Version History.',
    position: 'right',
  },
  {
    element: `#${resourcePanelLinksElementId}`,
    title: 'Extra links',
    intro:
      "Here is where you'll find links to documentation and lab settings including light/dark and font size.",
  },
  {
    element: `#${resourcePanelNavigationButtonElementId}`,
    title: 'Finish level',
    intro:
      'The button that allows you to submit or move to the next level can always be found at the bottom of the resource area. It will be disabled if you need to do more work to complete the level.',
  },
];
