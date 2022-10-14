// This class is not yet implemented. It is used for the modal function editor,
// which is used by Sprite Lab and Artist.
export default class FunctionEditor {
  // TODO
  constructor(
    opt_msgOverrides,
    opt_definitionBlockType,
    opt_parameterBlockTypes,
    opt_disableParamEditing,
    opt_paramTypes
  ) {}

  // TODO
  isOpen() {
    return false;
  }

  // TODO
  renameParameter(oldName, newName) {}

  // TODO
  refreshParamsEverywhere() {}

  // TODO
  openEditorForFunction(procedureBlock, functionName) {}

  // TODO
  openWithNewFunction() {}
}

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns XML block elements
 */
export function procedureFlyoutCategory(workspace) {
  const xmlList = [];
  if (Blockly.Blocks['procedures_defnoreturn']) {
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
    xmlList.push(block);

    if (xmlList.length) {
      // Add slightly larger gap between system blocks and user calls.
      xmlList[xmlList.length - 1].setAttribute('gap', 24);
    }

    // Find all user-created procedure definitions in the workspace.
    const allProcedureCalls = Blockly.Procedures.allProcedures(workspace)[0];
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
}
