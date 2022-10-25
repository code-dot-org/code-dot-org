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
  // <block type="procedures_defnoreturn" gap="24">
  //     <field name="NAME">do something</field>
  // </block>
  const block = Blockly.utils.xml.createElement('block');
  block.setAttribute('type', 'procedures_defnoreturn');
  // Add slightly larger gap between system blocks and user calls.
  block.setAttribute('gap', 24);
  const nameField = Blockly.utils.xml.createElement('field');
  nameField.setAttribute('name', 'NAME');
  nameField.appendChild(
    Blockly.utils.xml.createTextNode(
      Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE']
    )
  );
  block.appendChild(nameField);
  xmlList.push(block);

  // Find all user-created procedure definitions in the workspace.
  // allProcedures returns a pair of arrays, but we only need the first.
  // The second contains procedures with return variables which we don't support.
  // Each procedure is defined by a three-element list of name, parameter list,
  // and return value boolean (false).
  // https://developers.google.com/blockly/reference/js/blockly.procedures_namespace.allprocedures_1_function.md
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
    // The parameter list is likely empty as we don't currently support
    // functions with parameters. This loop is needed if that changes.
    for (let j = 0; j < args.length; j++) {
      const arg = Blockly.utils.xml.createElement('arg');
      arg.setAttribute('name', args[j]);
      mutation.appendChild(arg);
    }
    xmlList.push(block);
  }
  return xmlList;
}
