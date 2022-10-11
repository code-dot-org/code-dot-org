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
  if (
    (this.workspace.options.comments ||
      (this.workspace.options.parentWorkspace &&
        this.workspace.options.parentWorkspace.options.comments)) &&
    Blockly.Msg['PROCEDURES_DEFNORETURN_COMMENT']
  ) {
    this.setCommentText(Blockly.Msg['PROCEDURES_DEFNORETURN_COMMENT']);
  }
  this.setStyle('procedure_blocks');
  this.arguments_ = [];
  this.argumentVarModels_ = [];
  this.setStatements_(true);
  this.statementConnection_ = null;
}
