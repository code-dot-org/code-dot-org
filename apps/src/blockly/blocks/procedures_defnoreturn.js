import BlockSvgFunctional from '../addons/blockSvgFunctional';

// Used to customize function definition blocks for Google Blockly labs.
export default function() {
  const initName = Blockly.Procedures.findLegalName('', this);
  const nameField = new Blockly.FieldTextInput(
    initName,
    Blockly.Procedures.rename
  );
  nameField.setSpellcheck(false);
  this.appendDummyInput()
    .appendField(nameField, 'NAME')
    .appendField('', 'PARAMS');
  this.setStyle('procedure_blocks');
  this.arguments_ = [];
  this.argumentVarModels_ = [];
  this.setStatements_(true);
  this.statementConnection_ = null;
  this.functionalSvg_ = new BlockSvgFunctional(this);
  this.setOnChange(function(changeEvent) {
    if (!this.isInFlyout) {
      this.functionalSvg_.render(this.svgGroup_, this.RTL);
    }
  });
}
