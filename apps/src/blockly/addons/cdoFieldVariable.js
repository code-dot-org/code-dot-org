import GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';

const RENAME_THIS_ID = 'RENAME_THIS_ID';
const RENAME_ALL_ID = 'RENAME_ALL_ID';

export default class FieldVariable extends GoogleBlockly.FieldVariable {
  /**
   * Handle the selection of an item in the variable dropdown menu.
   * Special case the 'Rename all' and 'Rename this' options to prompt the user
   * for a new name.
   * @param {!Blockly.Menu} menu The Menu component clicked.
   * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
   * @protected
   */
  onItemSelected_(menu, menuItem) {
    const oldVar = this.getText();
    var id = menuItem.getValue();
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      switch (id) {
        case RENAME_ALL_ID:
          // Rename all instances of this variable.
          FieldVariable.modalPromptName(
            msg.renameAllPromptTitle({variableName: oldVar}),
            msg.rename(),
            oldVar,
            newName =>
              this.sourceBlock_.workspace.renameVariableById(
                this.variable_.getId(),
                newName
              )
          );
          break;
        case RENAME_THIS_ID:
          // Rename just this variable.
          FieldVariable.modalPromptName(
            msg.renameThisPromptTitle(),
            msg.create(),
            '',
            newName => {
              const newVar = this.sourceBlock_.workspace.createVariable(
                newName
              );
              this.setValue(newVar.getId());
            }
          );
          break;
        default:
          this.setValue(id);
          break;
      }
    }
  }
}

FieldVariable.originalDropdownCreate = FieldVariable.dropdownCreate;
FieldVariable.dropdownCreate = function() {
  const options = FieldVariable.originalDropdownCreate.call(this);

  // Remove the last two options (Delete and Rename)
  options.pop();
  options.pop();

  // Add our custom options (Rename this variable, Rename all)
  options.push([msg.renameAll({variableName: this.getText()}), RENAME_ALL_ID]);
  options.push([msg.renameThis(), RENAME_THIS_ID]);

  return options;
};

/**
 * Prompt the user for a variable name and perform some whitespace cleanup
 * @param {string} promptText description text for window prompt
 * @param {string} confirmButtonLabel Label of confirm button, e.g. "Rename"
 * @param {string} defaultText default input text for window prompt
 * @param {Function} callback with parameter (text) of new name
 */
FieldVariable.modalPromptName = function(
  promptText,
  confirmButtonLabel,
  defaultText,
  callback
) {
  Blockly.customSimpleDialog({
    bodyText: promptText,
    prompt: true,
    promptPrefill: defaultText,
    cancelText: confirmButtonLabel,
    confirmText: msg.cancel(),
    onConfirm: null,
    onCancel: callback
  });
};
