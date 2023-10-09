import experiments from '@cdo/apps/util/experiments';
import msg from '@cdo/locale';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
export const useModalFunctionEditor =
  window.appOptions?.level?.useModalFunctionEditor;
export const modalFunctionEditorExperimentEnabled = experiments.isEnabled(
  experiments.MODAL_FUNCTION_EDITOR
);

// This extension is used to add an edit button to the end of a procedure
// call block, if it should have an edit button. It uses the
// click handler passed as a parameter to handle editing.
export const modalFunctionEditButton = function (clickHandler) {
  // Edit buttons are used to open the modal editor. The button is appended to the last input.
  if (
    useModalFunctionEditor &&
    this.inputList.length &&
    !this.workspace.isFlyout
  ) {
    const button = new Blockly.FieldButton({
      value: msg.edit(),
      onClick: clickHandler,
      colorOverrides: {button: 'blue', text: 'white'},
    });
    this.inputList[this.inputList.length - 1].appendField(button, 'EDIT');
  }
};
