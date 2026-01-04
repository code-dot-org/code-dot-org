import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

import {BLOCK_TYPES, ToolboxType} from '@blockly-workspace/constants';

/**
 * Options for the `getAllGeneratedCode` method.
 */
export interface GetAllGeneratedCodeOptions {
  /** Specifies the block type to look for and filter just that. */
  startBlock?: string;
  /** The code to inject at the start of the generated code block. */
  extraCode?: string;
  /**
   * The workspaces to use. By default, it just looks at whatever Blockly
   * currently thinks is the main workspace.
   *
   * It will generate the code by appending each workspace in the order they
   * are specified in this list.
   */
  workspaces?: (Blockly.Workspace | undefined)[];
}

/**
 * Generates all code for the main workspace.
 */
export function getAllGeneratedCode(options?: GetAllGeneratedCodeOptions) {
  // Sets the lab code based on the student's blocks and any extra (e.g. initialization) code.
  // The students blocks are considered to be any on the main or hidden workspaces.
  let code = options?.extraCode || '';

  (options?.workspaces || [Blockly.getMainWorkspace()]).forEach(workspace => {
    if (workspace) {
      javascriptGenerator.init(workspace);
      const blocks = workspace.getTopBlocks(true);
      const blocksCode: (string | [string, number])[] = [];
      blocks.forEach(block => {
        if (
          options?.startBlock === undefined ||
          options?.startBlock === block.type
        ) {
          const blockCode = javascriptGenerator.blockToCode(block);
          blocksCode.push(blockCode);
        }
      });
      code += javascriptGenerator.finish(blocksCode.join('\n'));
    }
  });

  return code;
}

export function updateBlockEnabled(block: Blockly.Block, reason: string = Blockly.constants.MANUALLY_DISABLED) {
  // Changing blocks as part of this event shouldn't be undoable.
  const initialUndoFlag = Blockly.Events.getRecordUndo();
  try {
    Blockly.Events.setRecordUndo(false);
    const parent = block.getParent();
    if (parent && parent.isEnabled()) {
      const children = block.getDescendants(false);
      for (const child of children) {
        child.setDisabledReason(false, reason);
      }
    } else if (block.outputConnection || block.previousConnection) {
      let currentBlock: Blockly.Block | null = block;
      do {
        currentBlock.setDisabledReason(true, reason)
        currentBlock = currentBlock.getNextBlock();
      } while (currentBlock);
    }
  } finally {
    Blockly.Events.setRecordUndo(initialUndoFlag);
  }
}

/**
 * Disables all blocks that are not attached to a top block.
 */
export function disableOrphanBlocks(eventWorkspace: Blockly.Workspace) {
  // When a function definition is moved, we should not suddenly enable
  // its call blocks.
  eventWorkspace.getTopBlocks().forEach(block => {
    if (block.type === BLOCK_TYPES.procedureCall) {
      block.setDisabledReason(true, 'ORPHANED');
    }
    updateBlockEnabled(block, 'ORPHANED');
  });
}

export function getToolboxType(workspaceOverride?: Blockly.WorkspaceSvg) {
  const workspace: Blockly.WorkspaceSvg =
    workspaceOverride || (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
  if (!workspace) {
    return;
  }
  // True is passed so we only get the flyout directly owned by the workspace.
  // Otherwise getFlyout will return the flyout for the toolbox if it has categories.
  if (workspace.getFlyout(true)) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.getToolbox()) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth(
  workspaceOverride?: Blockly.WorkspaceSvg,
): number {
  const workspace: Blockly.WorkspaceSvg =
    workspaceOverride || (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
  const metrics = workspace.getMetrics();
  switch (getToolboxType(workspace)) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      break;
  }

  return 0;
}

/**
 * Extracts block elements from the provided XML and returns them partitioned based on their types.
 * If no block elements are found in the XML, an empty array is returned.
 *
 * @param {Element} xml - The XML element containing block elements.
 * @returns {Element[]} An array of block elements or an empty array if no blocks are present.
 */
export function getBlockElements(xml: Element): Element[] {
  // Convert XML to an array of block elements
  return Array.from(xml.querySelectorAll('xml > block'));
}

/**
 * Extracts the fields that are within a block.
 */
export function getBlockFields(block: Blockly.Block): Blockly.Field[] {
  const fields: Blockly.Field[] = [];
  block.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      fields.push(field);
    });
  });
  return fields;
}

export interface XmlBlockConfig {
  blocklyBlock: Blockly.Block;
  x: number;
  y: number;
}

/**
 * Decode an XML DOM and create blocks on the workspace while preserving the original order of blocks.
 *
 * @param xml - The XML DOM containing block elements to be created on the workspace.
 * @param workspace - The Blockly workspace where blocks will be created.
 * @returns An array of objects containing the created blocks and their positions.
 */
export function domToBlockSpace(
  xml: Element,
  workspace: Blockly.Workspace,
): Blockly.Block[] {
  const blockElements = getBlockElements(xml);
  const blocks: Blockly.Block[] = [];

  // To position the blocks, we first render them all to the Block Space
  //  and parse any X or Y coordinates set in the XML. Then, we store
  //  the rendered blocks and the coordinates in an array so that we can
  //  position them.
  blockElements.forEach(xmlChild => {
    // Check xmlChild and its children for XML attributes that need to be manipulated.
    //processBlockAndChildren(xmlChild);

    // Further manipulate the XML for specific top block types.
    //addNameToBlockFunctionDefinitionBlock(xmlChild);
    //addMutationToProcedureDefBlocks(xmlChild);
    //addMutationToMiniToolboxBlocks(xmlChild);
    //lockWhenRunBlock(xmlChild);

    const blockly_block = Blockly.Xml.domToBlock(xmlChild, workspace);
    //const x = parseInt(xmlChild.getAttribute('x') || '0', 10);
    //const y = parseInt(xmlChild.getAttribute('y') || '0', 10);
    blocks.push(blockly_block);
  });

  return blocks;
}

// Returns the student's executable code based on blockXml. Blocks are loaded onto
// a single unrendered workspace. Used for Artist solution blocks in the student view
// and Artist level predraw blocks.
export function getCodeFromBlockXmlSource(blockXmlString: string): string {
  const workspace = new Blockly.Workspace();
  const domBlocks = Blockly.utils.xml.textToDom(blockXmlString);

  // Go through each block and plop it in
  domToBlockSpace(domBlocks, workspace);
  javascriptGenerator.init(workspace);

  const blocks = workspace.getTopBlocks(true);
  const code: (string | [string, number])[] = [];
  blocks.forEach(block => code.push(javascriptGenerator.blockToCode(block)));
  const result = javascriptGenerator.finish(code.join('\n'));
  workspace.dispose();
  return result;
}

export function getCodeFromBlockJsonSource(json: {
  blocks?: {
    blocks?: Blockly.serialization.blocks.State[];
  };
}): string {
  const workspace = new Blockly.Workspace();
  javascriptGenerator.init(workspace);

  for (const jsonBlock of json.blocks?.blocks || []) {
    Blockly.serialization.blocks.append(jsonBlock, workspace);
  }
  const blocks = workspace.getTopBlocks(true);
  const code: (string | [string, number])[] = [];
  blocks.forEach(block => code.push(javascriptGenerator.blockToCode(block)));
  const result = javascriptGenerator.finish(code.join('\n'));
  workspace.dispose();
  return result;
}

export function getAllUsedBlocks(
  workspace: Blockly.Workspace,
): Blockly.Block[] {
  return workspace
    .getAllBlocks()
    .filter(block => block.isEnabled() && block.getRootBlock().isEnabled());
}
