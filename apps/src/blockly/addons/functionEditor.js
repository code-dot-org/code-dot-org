import xml from '@cdo/apps/xml';

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
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of XML block elements
 */
export function flyoutCategory(workspace) {
  // TODO: Add "Create a Function" button
  const newFunctionDefinitionBlock = newDefinitionBlock(
    Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE']
  );
  console.warn('The modal function editor has not been fully implemented yet.');

  // Find all user-created procedure definitions in the workspace.
  // allProcedures returns a pair of arrays, but we only need the first.
  // The second contains procedures with return variables which we don't support.
  // Each procedure is defined by a three-element list of name, parameter list,
  // and return value boolean (false).
  // https://developers.google.com/blockly/reference/js/blockly.procedures_namespace.allprocedures_1_function.md
  const allWorkspaceProcedures = Blockly.Procedures.allProcedures(workspace)[0];
  const functionCallBlocks = allCallBlocks(allWorkspaceProcedures);
  return [newFunctionDefinitionBlock, ...functionCallBlocks];
}

export function allCallBlocks(procedures) {
  let blockElements = [];
  for (let i = 0; i < procedures.length; i++) {
    const name = procedures[i][0];
    const args = procedures[i][1];

    const block = xml.parseElement('<block></block>', true);
    block.setAttribute('type', 'procedures_callnoreturn');
    block.setAttribute('gap', 16);

    const mutation = xml.parseElement('<mutation></mutation>', true);
    mutation.setAttribute('name', name);
    block.appendChild(mutation);

    // The argument list is likely empty as we don't currently support
    // functions with parameters. This loop is needed if that changes.
    for (let j = 0; j < args.length; j++) {
      const arg = xml.parseElement(`<arg name="${args[j]}"></arg>`, true);
      mutation.appendChild(arg);
    }
    blockElements.push(block);
  }
  return blockElements;
}

export function newDefinitionBlock(localizedNewFunctionString) {
  // Create a block with the following XML:
  // <block type="procedures_defnoreturn" gap="24">
  //     <field name="NAME">do something</field>
  // </block>
  const blockElement = xml.parseElement('<block></block>', true);
  blockElement.setAttribute('type', 'procedures_defnoreturn');
  // Add slightly larger gap between system blocks and user calls.
  blockElement.setAttribute('gap', 24);

  const nameField = xml.parseElement(
    `<field>${localizedNewFunctionString}</field>`,
    true
  );
  nameField.setAttribute('name', 'NAME');
  blockElement.appendChild(nameField);

  return blockElement;
}
