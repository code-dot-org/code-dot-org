import GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';

const RENAME_THIS_ID = 'RENAME_THIS_ID';
const RENAME_ALL_ID = 'RENAME_ALL_ID';

export default class CdoFieldVariable extends GoogleBlockly.FieldVariable {
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
          CdoFieldVariable.modalPromptName(
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
          CdoFieldVariable.modalPromptName(
            msg.renameThisPromptTitle(),
            msg.create(),
            '',
            newName => {
              const newVar =
                this.sourceBlock_.workspace.createVariable(newName);
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

  /**
   * Override of createTextArrow_ to fix the arrow position on Safari.
   * We need to add dominant-baseline="central" to the arrow element in order to
   * center it on Safari.
   *  @override */
  createTextArrow_() {
    // TODO: This field changes from arrow_ to arrow with the v10 upgrade.
    this.arrow_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TSPAN,
      {},
      this.textElement_
    );
    this.arrow_.appendChild(
      document.createTextNode(
        this.getSourceBlock()?.RTL
          ? Blockly.FieldDropdown.ARROW_CHAR + ' '
          : ' ' + Blockly.FieldDropdown.ARROW_CHAR
      )
    );
    this.arrow_.setAttribute('dominant-baseline', 'central');
    if (this.getSourceBlock()?.RTL) {
      this.getTextElement().insertBefore(this.arrow_, this.textContent_);
    } else {
      this.getTextElement().appendChild(this.arrow_);
    }
  }

  menuGenerator_ = function () {
    const options = CdoFieldVariable.dropdownCreate.call(this);

    // Remove the last two options (Delete and Rename)
    options.pop();
    options.pop();

    // Add our custom options (Rename this variable, Rename all)
    options.push([
      msg.renameAll({variableName: this.getText()}),
      RENAME_ALL_ID,
    ]);
    options.push([msg.renameThis(), RENAME_THIS_ID]);

    return options;
  };
}
// Fix built-in block
/**
 * Prompt the user for a variable name and perform some whitespace cleanup
 * @param {string} promptText description text for window prompt
 * @param {string} confirmButtonLabel Label of confirm button, e.g. "Rename"
 * @param {string} defaultText default input text for window prompt
 * @param {Function} callback with parameter (text) of new name
 */
CdoFieldVariable.modalPromptName = function (
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
    onCancel: callback,
  });
};
