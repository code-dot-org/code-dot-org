import {type StepOptions, type Tour} from 'shepherd.js';

import lab2I18n from '@cdo/apps/lab2/locale';
import {doneButton} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import {
  resourcePanelTabValidationElementId,
  resourcePanelValidateButtonElementId,
  resourcePanelValidationTableElementId,
} from './constants';

export const createValidationTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'validation-tab',
    attachTo: {
      element: `#${resourcePanelTabValidationElementId}`,
      on: 'right',
    },
    title: lab2I18n.validationTour_tabTitle(),
    text: lab2I18n.validationTour_tabText(),
    advanceOn: {
      selector: `#${resourcePanelTabValidationElementId}`,
      event: 'click',
    },
    scrollTo: false,
  },
  {
    id: 'validate-button',
    attachTo: {
      element: `#${resourcePanelValidateButtonElementId}`,
      on: 'right',
    },
    title: lab2I18n.validationTour_buttonTitle(),
    text: lab2I18n.validationTour_buttonText(),
    advanceOn: {
      selector: `#${resourcePanelValidateButtonElementId}`,
      event: 'click',
    },
    scrollTo: false,
  },
  {
    id: 'validation-results',
    attachTo: {
      element: `#${resourcePanelValidationTableElementId}`,
      on: 'bottom',
    },
    title: lab2I18n.validationTour_resultsTitle(),
    text: lab2I18n.validationTour_resultsText(),
    buttons: [doneButton(tour)],
    scrollTo: false,
  },
];
