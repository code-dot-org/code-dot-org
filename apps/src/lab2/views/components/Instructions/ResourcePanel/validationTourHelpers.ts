import lab2I18n from '@cdo/apps/lab2/locale';

export const VALIDATION_TOUR_STEPS = [
  {
    element: '#resource-panel-tab-validation',
    title: lab2I18n.validationTour_tabTitle(),
    intro: lab2I18n.validationTour_tabText(),
    position: 'right',
  },
  {
    element: '#resource-panel-validate-button',
    title: lab2I18n.validationTour_buttonTitle(),
    intro: lab2I18n.validationTour_buttonText(),
  },
  {
    element: '#resource-panel-validation-table',
    title: lab2I18n.validationTour_resultsTitle(),
    intro: lab2I18n.validationTour_resultsText(),
    position: 'bottom',
  },
];
