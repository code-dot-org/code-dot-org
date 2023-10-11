import experiments from '@cdo/apps/util/experiments';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
export const useModalFunctionEditor =
  window.appOptions?.level?.useModalFunctionEditor;
export const modalFunctionEditorExperimentEnabled = experiments.isEnabled(
  experiments.MODAL_FUNCTION_EDITOR
);
