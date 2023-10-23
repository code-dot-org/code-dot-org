import {convertXmlToJson} from '../../addons/cdoSerializationHelpers';
import msg from '@cdo/locale';

/**
 * Constructs the blocks required by the flyout for the variables category.
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns {Array<Object>} An array of JSON block elements.
 */
export function flyoutCategory(workspace) {
  const blockList = [];
  const newVariableButton = getNewVariableButtonWithCallback(workspace);
  blockList.push(newVariableButton);

  const categoryBlocks = flyoutCategoryBlocks(workspace);
  blockList.push(...categoryBlocks);
  const levelToolboxBlocks = Blockly.cdoUtils.getLevelToolboxBlocks('VARIABLE');
  if (!levelToolboxBlocks) {
    return;
  }
  const blocksConvertedJson = convertXmlToJson(
    levelToolboxBlocks.documentElement
  );
  const flyoutJson =
    Blockly.cdoUtils.getSimplifiedStateForFlyout(blocksConvertedJson);

  blockList.push(...flyoutJson);

  // The may include "change [var] by" blocks with custom default values.
  // If any of these blocks are found, we can remove the auto-generated block.
  // Count the 'math_change' blocks in blockList.
  const mathChangeBlocksCount = blockList.filter(
    block => block.type === 'math_change'
  ).length;
  // If there is more than one, remove the first occurrence which was auto-generated.
  if (mathChangeBlocksCount > 1) {
    const firstMathChangeIndex = blockList.findIndex(
      block => block.type === 'math_change'
    );
    if (firstMathChangeIndex !== -1) {
      blockList.splice(firstMathChangeIndex, 1);
    }
  }

  return blockList;
}

const getNewVariableButtonWithCallback = workspace => {
  const callbackKey = 'newVariableCallback';
  workspace.registerButtonCallback(callbackKey, () => {
    Blockly.FieldVariable.modalPromptName(
      msg.renameThisPromptTitle(),
      msg.create(),
      '',
      newName => {
        workspace.createVariable(newName);
      }
    );
  });

  return {
    kind: 'button',
    text: msg.createBlocklyVariable(),
    callbackKey,
  };
};

/**
 * Construct the blocks required by the flyout for the variable category.
 *
 * @param workspace The workspace containing variables.
 * @returns {Array<Object>} An array of JSON block objects for a flyout.
 */
export function flyoutCategoryBlocks(workspace) {
  const variableModelList = workspace.getVariablesOfType('');

  const blockList = [];
  if (variableModelList.length > 0) {
    if (Blockly.Blocks['variables_get']) {
      variableModelList.sort(Blockly.VariableModel.compareByName);
      variableModelList.forEach(variable => {
        const block = {
          kind: 'block',
          type: 'variables_get',
          fields: {
            VAR: {
              name: variable.name,
              type: variable.type,
            },
          },
        };
        blockList.push(block);
      });
    }
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];
    if (Blockly.Blocks['variables_set']) {
      const block = {
        kind: 'block',
        type: 'variables_set',
        fields: {
          VAR: {name: mostRecentVariable.name, type: mostRecentVariable.type},
        },
      };
      blockList.push(block);
    }
    if (Blockly.Blocks['math_change']) {
      const block = {
        kind: 'block',
        type: 'math_change',
        fields: {
          VAR: mostRecentVariable,
        },
        inputs: {
          DELTA: {
            shadow: {
              type: 'math_number',
              fields: {
                NUM: 1,
              },
            },
          },
        },
      };
      blockList.push(block);
    }
  }
  return blockList;
}
