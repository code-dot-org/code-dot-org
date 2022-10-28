import msg from '@cdo/locale';
import BlockSvgFrame from './blockSvgFrame.js';
/**
 * Used to customize function definition blocks for Google Blockly labs.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/blocks/procedures.js#L449-L490
 */
export const FUNCTION_BLOCK = {
  init: function() {
    const initName = Blockly.Procedures.findLegalName('', this);
    const nameField = new Blockly.FieldTextInput(
      initName,
      Blockly.Procedures.rename
    );
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(' ')
      .appendField(nameField, 'NAME')
      .appendField('', 'PARAMS');
    this.setStyle('procedure_blocks');
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
    this.functionalSvg_ = new BlockSvgFrame(
      this,
      msg.function(),
      'blocklyFunctionalFrame'
    );
    this.setOnChange(function(changeEvent) {
      if (!this.isInFlyout) {
        this.functionalSvg_.render(this.svgGroup_, this.RTL);
      }
    });
  }
};
