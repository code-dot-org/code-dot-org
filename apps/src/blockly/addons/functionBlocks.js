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
      .appendField(nameField, 'NAME')
      .appendField('', 'PARAMS');
    this.setStyle('procedure_blocks');
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  }
};

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns XML block elements
 */
export function FUNCTION_CATEGORY(workspace, testProcedures) {
  const xmlList = [];
  // Create a block with the following XML:
  // <block type="procedures_defnoreturn" gap="16">
  //     <field name="NAME">do something</field>
  // </block>
  const block = Blockly.utils.xml.createElement('block');
  block.setAttribute('type', 'procedures_defnoreturn');
  block.setAttribute('gap', 16);
  const nameField = Blockly.utils.xml.createElement('field');
  nameField.setAttribute('name', 'NAME');
  nameField.appendChild(
    Blockly.utils.xml.createTextNode(
      Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE']
    )
  );
  block.appendChild(nameField);
  // Add slightly larger gap between system blocks and user calls.
  block.setAttribute('gap', 24);
  xmlList.push(block);

  // Find all user-created procedure definitions in the workspace.
  // allProcedures returns a pair of arrays, but we only need the first.
  const allProcedureCalls = workspace
    ? Blockly.Procedures.allProcedures(workspace)[0]
    : testProcedures;
  for (let i = 0; i < allProcedureCalls.length; i++) {
    const name = allProcedureCalls[i][0];
    const args = allProcedureCalls[i][1];
    const block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'procedures_callnoreturn');
    block.setAttribute('gap', 16);
    const mutation = Blockly.utils.xml.createElement('mutation');
    mutation.setAttribute('name', name);
    block.appendChild(mutation);
    for (let j = 0; j < args.length; j++) {
      const arg = Blockly.utils.xml.createElement('arg');
      arg.setAttribute('name', args[j]);
      mutation.appendChild(arg);
    }
    xmlList.push(block);
  }
  return xmlList;
}
