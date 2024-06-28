import GoogleBlockly, {
  FieldDropdown,
  FieldVariable,
  Menu,
  MenuItem,
  MenuOption,
  VariableModel,
} from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

const RENAME_THIS_ID = 'RENAME_THIS_ID';
const RENAME_ALL_ID = 'RENAME_ALL_ID';

interface VariableNamePromptOptions {
  promptText: string; // Description text for window prompt
  confirmButtonLabel: string; // Label of confirm button, e.g., "Rename"
  defaultText: string; // Default input text for window prompt
  callback: (newName: string) => void; // Callback with text of new variable name
}
export default class CdoFieldVariable extends GoogleBlockly.FieldVariable {
  /**
   * Handle the selection of an item in the variable dropdown menu.
   * Special case the 'Rename all' and 'Rename this' options to prompt the user
   * for a new name.
   * @param {!Blockly.Menu} menu The Menu component clicked.
   * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
   * @protected
   */
  onItemSelected_(menu: Menu, menuItem: MenuItem) {
    const oldVar = this.getText();
    const id = menuItem.getValue();
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      switch (id) {
        case RENAME_ALL_ID:
          // Rename all instances of this variable.
          CdoFieldVariable.variableNamePrompt({
            promptText: commonI18n.renameAllPromptTitle({variableName: oldVar}),
            confirmButtonLabel: commonI18n.rename(),
            defaultText: oldVar,
            callback: newName =>
              this.sourceBlock_?.workspace.renameVariableById(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ((this as any).variable as VariableModel).getId(),
                newName
              ),
          });
          break;
        case RENAME_THIS_ID:
          // Rename just this variable.
          CdoFieldVariable.variableNamePrompt({
            promptText: commonI18n.renameThisPromptTitle(),
            confirmButtonLabel: commonI18n.create(),
            defaultText: '',
            callback: newName => {
              const newVar =
                this.sourceBlock_?.workspace.createVariable(newName);
              if (newVar) {
                this.setValue(newVar.getId());
              }
            },
          });
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
    const arrow = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TSPAN,
      {},
      this.textElement_
    );
    arrow.appendChild(
      document.createTextNode(
        this.getSourceBlock()?.RTL
          ? Blockly.FieldDropdown.ARROW_CHAR + ' '
          : ' ' + Blockly.FieldDropdown.ARROW_CHAR
      )
    );

    /**
     * Begin CDO customization
     */
    arrow.setAttribute('dominant-baseline', 'central');
    /**
     * End CDO customization
     */

    if (this.getSourceBlock()?.RTL) {
      this.getTextElement().insertBefore(arrow, this.textContent_);
    } else {
      this.getTextElement().appendChild(arrow);
    }
    // this.arrow is private in the parent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).arrow = arrow;
  }

  menuGenerator_ = function (this: FieldDropdown): MenuOption[] {
    const options = CdoFieldVariable.dropdownCreate.call(this as FieldVariable);

    // Remove the last two options (Delete and Rename)
    options.pop();
    options.pop();

    // Add our custom options (Rename this variable, Rename all)
    options.push([
      commonI18n.renameAll({variableName: this.getText()}),
      RENAME_ALL_ID,
    ]);
    options.push([commonI18n.renameThis(), RENAME_THIS_ID]);

    return options;
  };

  /**
   * Prompt the user for a variable name and perform some whitespace cleanup
   * @param {VariableNamePromptOptions} options The options object.
   */
  static variableNamePrompt = function (options: VariableNamePromptOptions) {
    Blockly.customSimpleDialog({
      bodyText: options.promptText,
      prompt: true,
      promptPrefill: options.defaultText,
      cancelText: options.confirmButtonLabel,
      confirmText: commonI18n.cancel(),
      onConfirm: null,
      onCancel: options.callback,
      disableSpaceClose: true,
    });
  };
}
