import {WorkspaceSvg} from 'blockly';
import {BlockInfo, FlyoutItemInfoArray} from 'blockly/core/utils/toolbox';

import {convertXmlToJson} from '@cdo/apps/blockly/addons/cdoSerializationHelpers';
import {commonI18n} from '@cdo/apps/types/locale';

/**
 * Constructs the blocks required by the flyout for the variables category.
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns {FlyoutDefinition} An array of JSON block elements.
 */
export function flyoutCategory(workspace: WorkspaceSvg) {
  const blockList: FlyoutItemInfoArray = [];
  const newVariableButton = getNewVariableButtonWithCallback(workspace);
  blockList.push(newVariableButton);

  const categoryBlocks = flyoutCategoryBlocks(workspace);
  blockList.push(...categoryBlocks);

  // Add blocks from the level toolbox XML, if present.
  const levelToolboxBlocks = Blockly.cdoUtils.getLevelToolboxBlocks('VARIABLE');
  if (!levelToolboxBlocks?.querySelector('xml')?.hasChildNodes()) {
    return blockList;
  }

  // Blockly supports XML or JSON, but not a combination of both.
  // We convert to JSON here because the behavior_get blocks are JSON.
  const blocksConvertedJson = convertXmlToJson(
    levelToolboxBlocks.documentElement
  );
  const flyoutJson =
    Blockly.cdoUtils.getSimplifiedStateForFlyout(blocksConvertedJson);

  blockList.push(...flyoutJson);

  // The toolox may include "change [var] by" blocks with custom default values.
  // If any of these blocks are found, we can remove the auto-generated block.
  // Count the 'math_change' blocks in blockList.
  const mathChangeBlocksCount = blockList.filter(
    block => (block as BlockInfo).type === 'math_change'
  ).length;
  // If there is more than one, remove the first occurrence which was auto-generated.
  if (mathChangeBlocksCount > 1) {
    const firstMathChangeIndex = blockList.findIndex(
      block => (block as BlockInfo).type === 'math_change'
    );
    if (firstMathChangeIndex !== -1) {
      blockList.splice(firstMathChangeIndex, 1);
    }
  }

  return blockList;
}

const getNewVariableButtonWithCallback = (workspace: WorkspaceSvg) => {
  const callbackKey = 'newVariableCallback';
  workspace.registerButtonCallback(callbackKey, () => {
    Blockly.FieldVariable.variableNamePrompt({
      promptText: commonI18n.renameThisPromptTitle(),
      confirmButtonLabel: commonI18n.create(),
      defaultText: '',
      callback: newName => {
        workspace.createVariable(newName);
      },
    });
  });

  return {
    kind: 'button',
    text: commonI18n.createBlocklyVariable(),
    callbackKey,
  };
};

/**
 * Construct the blocks required by the flyout for the variable category.
 *
 * @param workspace The workspace containing variables.
 * @returns {Array<Object>} An array of JSON block objects for a flyout.
 */
export function flyoutCategoryBlocks(workspace: WorkspaceSvg) {
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
