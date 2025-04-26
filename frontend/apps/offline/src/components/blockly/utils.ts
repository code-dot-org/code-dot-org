import * as BlocklyLibrary from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

export interface GetAllGeneratedCodeOptions {
  /** Specifies the block type to look for and filter just that. */
  startBlock?: string;
  /** The code to inject at the start of the generated code block. */
  extraCode?: string;
}

// Sets the lab code based on the student's blocks and any extra (e.g. initialization) code.
// The students blocks are considered to be any on the main or hidden workspaces.
export function getAllGeneratedCode(options?: GetAllGeneratedCodeOptions) {
  let code = options?.extraCode || '';

  [BlocklyLibrary.getMainWorkspace()].forEach(workspace => {
    if (workspace) {
      javascriptGenerator.init(workspace);
      const blocks = workspace.getTopBlocks(true);
      const blocksCode: (string | [string, number])[] = [];
      blocks.forEach(block => {
        if (
          options?.startBlock === undefined ||
          options?.startBlock === block.type
        ) {
          blocksCode.push(javascriptGenerator.blockToCode(block));
        }
      });
      code += javascriptGenerator.finish(blocksCode.join('\n'));
    }
  });

  console.log('GENERATED CODE', code);
  return code;
}
