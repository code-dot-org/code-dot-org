import * as blockUtils from '@cdo/apps/block_utils';
import {BlockDefinition, CustomInputTypes} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';

// blocksCommon is a plain CommonJS module (exports.install = ...); give it a
// minimal typed view.
const blocksCommon = blocksCommonModule as unknown as {
  install: (blockly: unknown, options: object) => void;
};

// Installs the Sprite Lab block definitions and their JS generators into the
// global Blockly once per page. This is the StudioApp-free equivalent of the
// install performed in appMain.js (blocksCommon.install + blocksModule.install).
// Sprite Lab's own install() also wires up the behavior FunctionEditor and
// custom procedure blocks, so we rely on it rather than re-registering blocks
// individually the way dance/blockly/setup.ts does.
let isSetup = false;

export function setupSpriteLab2BlocklyEnvironment(
  skin: object = {},
  level: object = {}
): void {
  if (isSetup) {
    return;
  }
  const blockInstallOptions = {skin, isK1: false, level};
  blocksCommon.install(Blockly, blockInstallOptions);
  spritelabBlocks.install(Blockly, blockInstallOptions);
  isSetup = true;
}

/**
 * Installs the level's shared/custom block definitions (the DB-backed Sprite Lab
 * block pool, e.g. GamelabJr) and returns a map of category -> block type names
 * for toolbox construction. Mirrors dance/blockly/setup.ts installSharedBlocks.
 */
export function installSharedBlocks(sharedBlocks: BlockDefinition[]): {
  [category: string]: string[];
} {
  return blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: sharedBlocks || [],
    customInputTypes:
      spritelabBlocks.customInputTypes as unknown as CustomInputTypes,
  });
}

/**
 * Remove <block>/<shadow> elements from a toolbox XML string whose type isn't
 * registered in Blockly. A level's toolbox can reference blocks that aren't in
 * the installed block pool; without filtering, opening that category throws
 * "Invalid block definition for type ...". Call after blocks are installed.
 */
export function filterToolboxToRegisteredBlocks(toolboxXml: string): string {
  try {
    const doc = new DOMParser().parseFromString(toolboxXml, 'text/xml');
    ['block', 'shadow'].forEach(tag => {
      // Snapshot to an array since we mutate the tree while iterating.
      Array.from(doc.getElementsByTagNameNS('*', tag)).forEach(el => {
        const type = el.getAttribute('type');
        // el.parentNode may already be null if an unregistered ancestor was
        // removed first.
        if (type && !Blockly.Blocks[type] && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    });
    return new XMLSerializer().serializeToString(doc);
  } catch {
    return toolboxXml;
  }
}
