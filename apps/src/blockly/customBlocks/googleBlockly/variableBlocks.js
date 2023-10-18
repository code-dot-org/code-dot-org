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

  const levelConfigBlocks = Array.from(
    Blockly.cdoUtils.getCustomCategoryBlocksForFlyout('VARIABLE')
  );

  let mathChangeBlock = null;

  // Find and get the "math_change" block if it exists, and remove it from levelConfigBlocks
  const updatedLevelConfigBlocks = levelConfigBlocks.filter(block => {
    if (block.getAttribute('type') === 'math_change') {
      mathChangeBlock = block;
      return false; // Exclude the math_change block
    }
    return true; // Include other blocks
  });

  // Call flyoutCategoryBlocks with the mathChangeBlock if found
  const categoryBlocks = flyoutCategoryBlocks(workspace, mathChangeBlock);

  return [button, ...categoryBlocks, ...updatedLevelConfigBlocks];
}

/**
 * Construct the blocks required by the flyout for the variable category.
 * Modifed version of Blockly.Variables.flyoutCategoryBlocks that skips 'math_change' blocks.
 * @param workspace The workspace containing variables.
 * @returns Array of XML block elements.
 */
function flyoutCategoryBlocks(workspace, mathChangeBlock) {
  const variableModelList = workspace.getVariablesOfType('');

  const xmlList = [];
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];

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
    if (Blockly.Blocks['variables_set']) {
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'variables_set');
      block.setAttribute('gap', '8');
      block.appendChild(
        Blockly.Variables.generateVariableFieldDom(mostRecentVariable)
      );
      xmlList.push(block);
    }
    if (Blockly.Blocks['math_change'] && !mathChangeBlock) {
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'math_change');
      block.setAttribute('gap', Blockly.Blocks['variables_get'] ? '20' : '8');
      block.appendChild(
        Blockly.Variables.generateVariableFieldDom(mostRecentVariable)
      );
      const value = Blockly.utils.xml.textToDom(
        '<value name="DELTA">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>'
      );
      block.appendChild(value);
      xmlList.push(block);
    }
  }
  if (mathChangeBlock) {
    // Use the provided math_change block
    xmlList.push(mathChangeBlock);
  }
  return xmlList;
}
