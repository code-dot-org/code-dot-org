/**
 * Constructs the blocks required by the flyout for the variables category.
 * @param {WorkspaceSvg} workspace The workspace containing variables.
 * @returns an array of XML block elements
 */
export function flyoutCategory(workspace) {
  const button = document.createElement('button');
  button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function (button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
  });

  let blockList = [button];

  blockList.push(
    ...Blockly.cdoUtils.getCustomCategoryBlocksForFlyout('VARIABLE')
  );

  const xmlBlockList = flyoutCategoryBlocks(workspace);
  blockList = blockList.concat(xmlBlockList);

  return blockList;
}

/**
 * Construct the blocks required by the flyout for the variable category.
 * Modifed version of Blockly.Variables.flyoutCategoryBlocks that skips 'math_change' blocks.
 * @param workspace The workspace containing variables.
 * @returns Array of XML block elements.
 */
function flyoutCategoryBlocks(workspace) {
  const variableModelList = workspace.getVariablesOfType('');

  const xmlList = [];
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];
    if (Blockly.Blocks['variables_set']) {
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'variables_set');
      block.setAttribute('gap', '8');
      block.appendChild(
        Blockly.Variables.generateVariableFieldDom(mostRecentVariable)
      );
      xmlList.push(block);
    }

    if (Blockly.Blocks['variables_get']) {
      variableModelList.sort(Blockly.VariableModel.compareByName);
      for (let i = 0, variable; (variable = variableModelList[i]); i++) {
        const block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', 'variables_get');
        block.setAttribute('gap', '8');
        block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
        xmlList.push(block);
      }
    }
  }
  return xmlList;
}
