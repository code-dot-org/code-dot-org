// Code for a scene that is not the open one, compiled from its saved
// source on a throwaway workspace.

import * as BlocklyCore from 'blockly/core';

import {applyLevelDefaults} from './imagePickerFields';

/**
 * The code of a saved scene source, or '' for none. A dropdown the source
 * saved no value for takes the level's default here, as it would on screen,
 * so a starter block the level wrote without a costume names the hero
 * rather than whatever image is newest.
 */
export function getCodeFromSceneSource(source: object | undefined): string {
  if (!source) {
    return '';
  }
  const workspace = new BlocklyCore.Workspace();
  try {
    BlocklyCore.serialization.workspaces.load(source, workspace);
    applyLevelDefaults(workspace);
    return Blockly.JavaScript.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}
