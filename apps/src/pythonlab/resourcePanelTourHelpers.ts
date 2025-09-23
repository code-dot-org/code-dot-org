// import React from 'react';

// import i18n from '@cdo/locale';

// intro.js-react allows a string or a react component for the intro prop.
// Providing a string that was written by a translator is risky, because it
// could contain malicious HTML. This helper method wraps the string in a react
// fragment, which will take care of sanitizing the string.
// const sanitize = unsafe => <>{unsafe}</>;

export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: '#resource-panel-instructions',
    title: 'Resource Panel Instructions',
    intro:
      'All your helpful resources can be found in the resource panel. When starting a level it will always show the instructions tab first.',
  },
  {
    element: '#resource-panel-tabs',
    title: 'Resource Panel Tabs',
    intro:
      'There are tabs for each of the resources you need while working on a level including Instructions, Validation and Version History.',
  },
  {
    element: '#resource-panel-links',
    title: 'Resource Panel Links',
    intro:
      "Here is where you'll find links to documentation and lab settings including light/dark and font size",
  },
  {
    title: 'Resource Panel Button',
    intro:
      'The Continue button can always be found at the bottom of the resource area. It will be disabled if you need to do more work to complete the level.',
  },
  {
    element: '#resource-panel-validation',
    title: 'Resource Panel Validation',
    intro:
      'For most levels, you will need to run validation after completing the steps in the instructions. This tab is where you go to test your code and see the results.',
  },
];
