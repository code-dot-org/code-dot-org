// import lab2I18n from '@cdo/apps/lab2/locale';

export const INITIAL_STEP = 0;

export const VALIDATION_TOUR_STEPS = [
  {
    element: '#resource-panel-tab-validation',
    title: 'Step 1: Validation Tab',
    intro:
      'For most levels you will need to run validation after completing the steps in the instructions to continue to the next level. Click the validation tab to open it.',
    position: 'right',
  },
  {
    element: '#resource-panel-validate-button',
    title: 'Step 2: Validate Button',
    intro:
      "Use the 'Validate' button to check if your code meets the level's requirements. Go ahead and click 'Validate' now.",
  },
  {
    element: '#resource-panel-validation-table',
    title: 'Step 3: Validation Results',
    intro:
      "Your results will appear in this table, showing which tests passed and what still needs work. You can click 'Validate' again to rerun the tests.",
    position: 'bottom',
  },
];

// Legacy exports for backward compatibility
export const VALIDATION_TAB_STEP = [VALIDATION_TOUR_STEPS[0]];
export const VALIDATION_BUTTON_STEP = [VALIDATION_TOUR_STEPS[1]];
export const VALIDATION_TABLE_STEP = [VALIDATION_TOUR_STEPS[2]];
