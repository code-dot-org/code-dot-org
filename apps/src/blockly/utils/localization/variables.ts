import * as BlocklyCore from 'blockly/core';

import {ExtendedWorkspaceSvg} from '@cdo/apps/blockly/types';
import localization from '@cdo/apps/localization';

/**
 * Reverts localized variables in a workspace to their source (English) forms.
 */
export function unlocalizeVariables(workspace: ExtendedWorkspaceSvg) {
  // Go through the original variables and return them to their source language.
  for (const variable of workspace.getAllVariables()) {
    if (Blockly.SourceVariables[variable.getId()]) {
      workspace.renameVariableById(
        variable.getId(),
        Blockly.SourceVariables[variable.getId()]
      );
    }
  }
}

export function initializeVariableLocalization(
  workspace: ExtendedWorkspaceSvg
) {
  // Clear known variables
  Blockly.SourceVariables = {};
  workspace.sourceGlobalVariables = [];

  const flyout = workspace.getFlyout(true);
  if (flyout) {
    // For the flyout, we have to find all of the variables in the input list
    // for each block in the flyout. Blockly does not give us a convenient way
    // to do this, but this is modelled after the block methods to pull out
    // all of the variable ids in the block (Block.getVars())
    const flyoutWorkspace = flyout.getWorkspace();
    if (flyoutWorkspace) {
      for (const block of flyoutWorkspace.getTopBlocks()) {
        for (const input of block?.inputList || []) {
          for (const field of input?.fieldRow || []) {
            if (field?.referencesVariables()) {
              const varField = field as BlocklyCore.FieldVariable;
              const variable = varField?.getVariable();
              if (variable) {
                const id = variable.getId();
                const oldName = variable.getName();
                Blockly.SourceVariables[id] = oldName;

                // And we note them as 'global' variables
                if (!workspace.sourceGlobalVariables.includes(oldName)) {
                  workspace.sourceGlobalVariables.push(oldName);
                }
              }
            }
          }
        }
      }
    }
  }

  // We keep track of all variables in the workspace
  for (const variable of workspace.getAllVariables()) {
    const id = variable.getId();
    const oldName = variable.getName();
    Blockly.SourceVariables[id] = oldName;

    // And we note them as 'global' variables
    if (!workspace.sourceGlobalVariables.includes(oldName)) {
      workspace.sourceGlobalVariables.push(oldName);
    }
  }

  // Keep track of the installed global variables, too
  if (workspace.globalVariables) {
    workspace.sourceGlobalVariables = workspace.sourceGlobalVariables.concat(
      workspace.globalVariables
    );
  }
}

/**
 * Goes through workspace variables and localizes them.
 */
export function localizeVariables(workspace: ExtendedWorkspaceSvg) {
  // Localize the flyout, if there is one
  const languageTree = workspace.options.languageTree;
  if (languageTree) {
    // Update the language tree that is used to represent the flyout blocks
    for (const [id, oldName] of Object.entries(Blockly.SourceVariables)) {
      let newName: string = localization.translate(`[variable] ${oldName}`, [
        'blockly-variable',
        'blockly-block',
      ]);
      if (newName.startsWith('[variable] ')) {
        newName = newName.substring(11);
      } else {
        console.error(
          'Global variable translation does not have the [variable] tag',
          oldName,
          newName
        );
        newName = oldName;
      }

      for (const node of languageTree?.contents || []) {
        const blockNode = node as BlocklyCore.utils.toolbox.BlockInfo;
        const xml = blockNode.blockxml;
        if (xml !== undefined && typeof xml !== 'string') {
          const node = xml as HTMLElement;
          for (const el of Array.from(
            node.querySelectorAll(`field[id="${id}"]`) || []
          )) {
            const fieldElement = el as HTMLElement;
            fieldElement.textContent = newName;
          }
        }
      }
    }
  }

  for (const variable of workspace.getAllVariables()) {
    Blockly.SourceVariables[variable.getId()] ||= variable.getName();
    const oldName = Blockly.SourceVariables[variable.getId()];

    // Make sure we've seen the old name before
    if (workspace.sourceGlobalVariables?.includes(oldName)) {
      const globalVariableIndex =
        workspace.sourceGlobalVariables.indexOf(oldName);
      let newName: string = localization.translate(`[variable] ${oldName}`, [
        'blockly-variable',
        'blockly-block',
      ]);
      if (newName.startsWith('[variable] ')) {
        newName = newName.substring(11);
      } else {
        console.error(
          'Global variable translation does not have the [variable] tag',
          oldName,
          newName
        );
        newName = oldName;
      }

      workspace.renameVariableById(variable.getId(), newName);
      if (workspace.globalVariables?.[globalVariableIndex]) {
        workspace.globalVariables[globalVariableIndex] = newName;
      }
    }
  }
}
