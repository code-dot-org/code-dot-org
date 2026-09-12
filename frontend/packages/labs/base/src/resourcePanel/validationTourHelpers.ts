import {
  resourcePanelTabValidationElementId,
  resourcePanelValidateButtonElementId,
  resourcePanelValidationTableElementId,
} from './constants';

export const VALIDATION_TOUR_STEPS = [
  {
    element: `#${resourcePanelTabValidationElementId}`,
    title: 'Validation Tour',
    intro:
      'For most levels you will need to run validation after completing the steps in the instructions to continue to the next level. Click the validation tab to open it and then click Next to continue.',
    position: 'right',
  },
  {
    element: `#${resourcePanelValidateButtonElementId}`,
    title: 'Validate Button',
    intro:
      "Use the 'Validate' button to check if your code meets the level's requirements. Go ahead and click 'Validate' now and then click Next to continue.",
  },
  {
    element: `#${resourcePanelValidationTableElementId}`,
    title: 'Validation Results',
    intro:
      "Your results will appear in this table, showing which tests passed and what still needs work. You can click 'Validate' again to rerun the tests.",
    position: 'bottom',
  },
];
