import * as BlockUtils from '@cdo/apps/block_utils';
import {ExtendedWorkspaceSvg} from '@cdo/apps/blockly/types';
import localization from '@cdo/apps/localization';

import {refreshWorkspace} from '../workspace/refresh';

import {localizeVariables} from './variables';

/**
 * Updates the locale and localization strings for all workspaces.
 */
export function updateLocale(rtl: boolean) {
  // Call into our localization engine to get the new blocks and refresh all active
  // workspaces.

  // Copy over new localization keys for the normal blocks in 'Msg'
  for (const [key, value] of Object.entries(Blockly.Msg || {})) {
    Blockly.SourceMsg[key] ||= value;
    Blockly.Msg[key] = localization.translate(Blockly.SourceMsg[key], [
      'blockly-block',
    ]);
  }

  // Go through custom and shared blocks to translate the blockText there
  // This means recreating the block init() functions with updated block
  // configurations.
  for (const blockName of Object.keys(
    Blockly.SourceCustomBlocks.blockDefinitionsByName
  )) {
    const blockDefinition =
      Blockly.SourceCustomBlocks.blockDefinitionsByName[blockName];
    Blockly.SourceCustomBlocks.blockTexts[blockName] ||=
      blockDefinition.config.blockText;
    const oldBlockText = Blockly.SourceCustomBlocks.blockTexts[blockName];
    let newBlockText: string = oldBlockText;
    if (blockDefinition.config.returnType === 'Behavior') {
      newBlockText = localization.translate(`[behavior] ${oldBlockText}`, [
        'blockly-block',
        'blockly-behavior',
      ]);
      if (newBlockText.startsWith('[behavior] ')) {
        newBlockText = newBlockText.substring(11);
      } else {
        console.error(
          'Behavior translation does not have the [behavior] tag',
          oldBlockText,
          newBlockText
        );
      }
    } else {
      newBlockText = localization.translate(oldBlockText, ['blockly-block']);
    }

    // Unfreeze the block definition to add the new translation strings
    Blockly.SourceCustomBlocks.blockDefinitionsByName[blockName] = {
      ...blockDefinition,
      config: {
        ...blockDefinition.config,
        blockText: newBlockText,
      },
    };
  }

  const blockDefinitions = Object.values(
    Blockly.SourceCustomBlocks.blockDefinitionsByName
  );

  BlockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions,
    customInputTypes: Blockly.SourceCustomInputTypes,
  });

  const mainWorkspace = Blockly.getMainWorkspace();
  if (mainWorkspace) {
    mainWorkspace.RTL = rtl;
    localizeVariables(mainWorkspace as ExtendedWorkspaceSvg);
    refreshWorkspace(mainWorkspace as ExtendedWorkspaceSvg);
  }

  // Refresh embedded workspaces (blocks in instructions, documentation, etc)
  Blockly.embeddedWorkspaces.forEach(workspace_id => {
    const workspace = Blockly.Workspace.getById(
      workspace_id
    ) as ExtendedWorkspaceSvg;
    if (workspace) {
      workspace.RTL = rtl;
      localizeVariables(workspace as ExtendedWorkspaceSvg);
      refreshWorkspace(workspace);
    }
  });
}
