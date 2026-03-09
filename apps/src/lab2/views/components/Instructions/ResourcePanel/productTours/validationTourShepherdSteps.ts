import {offset} from '@floating-ui/dom';
import {type StepOptions, type Tour} from 'shepherd.js';

import {
  resourcePanelValidationTabButtonElementId,
  instructionsValidateButtonElementId,
  resourcePanelValidationTableElementId,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {doneButton} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

export const createValidationTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'validation-tab',
    attachTo: {
      element: `#${resourcePanelValidationTabButtonElementId}`,
      on: 'right',
    },
    title: 'Validation Tour',
    text: 'For most levels you will need to run validation after completing the steps in the instructions to continue to the next level. Click the validation tab to open it.',
    advanceOn: {
      selector: `#${resourcePanelValidationTabButtonElementId}`,
      event: 'click',
    },
  },
  {
    id: 'validate-button',
    attachTo: {
      element: `#${instructionsValidateButtonElementId}`,
      on: 'right',
    },
    title: 'Validate Button',
    text: "Use the 'Validate' button to check if your code meets the level's requirements. Go ahead and click 'Validate' now.",
    advanceOn: {
      selector: `#${instructionsValidateButtonElementId}`,
      event: 'click',
    },
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
  {
    id: 'validation-results',
    attachTo: {
      element: `#${resourcePanelValidationTableElementId}`,
      on: 'bottom',
    },
    title: 'Validation Results',
    text: "Your results will appear in this table, showing which tests passed and what still needs work. You can click 'Validate' again to rerun the tests.",
    buttons: [doneButton(tour)],
  },
];
