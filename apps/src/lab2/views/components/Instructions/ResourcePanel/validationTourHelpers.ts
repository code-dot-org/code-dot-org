import lab2I18n from '@cdo/apps/lab2/locale';

import {
  resourcePanelTabValidationElementId,
  resourcePanelValidateButtonElementId,
  resourcePanelValidationTableElementId,
} from './constants';

export const VALIDATION_TOUR_STEPS = [
  {
    element: `#${resourcePanelTabValidationElementId}`,
    title: lab2I18n.validationTour_tabTitle(),
    intro: lab2I18n.validationTour_tabText(),
    position: 'right',
  },
  {
    element: `#${resourcePanelValidateButtonElementId}`,
    title: lab2I18n.validationTour_buttonTitle(),
    intro: lab2I18n.validationTour_buttonText(),
  },
  {
    element: `#${resourcePanelValidationTableElementId}`,
    title: lab2I18n.validationTour_resultsTitle(),
    intro: lab2I18n.validationTour_resultsText(),
    position: 'bottom',
  },
];
