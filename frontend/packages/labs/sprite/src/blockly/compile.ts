import * as BlocklyCore from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

import type {BlocklySerialization} from '@code-dot-org/blockly';

/**
 * The program a saved workspace compiles to, without rendering it: for a
 * scene that is not open in the editor. Its blocks must be registered.
 */
export function compileSerializedWorkspace(
  source: BlocklySerialization,
): string {
  const workspace = new BlocklyCore.Workspace();
  try {
    BlocklyCore.serialization.workspaces.load(source, workspace);
    return javascriptGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}
