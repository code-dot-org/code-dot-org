import * as BlocklyCore from 'blockly/core';

import * as blockUtils from '@cdo/apps/block_utils';
import {
  BlockDefinition,
  CustomInputTypes,
  ExtendedBlock,
} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';

import labBlockDefinitions from './blockDefinitions';
import {
  FIELD_SCENE_DROPDOWN_TYPE,
  GO_TO_SCENE_BLOCK_TYPE,
  SceneDropdown,
} from './blockDefinitions/goToScene';
import {EVENT_HAT_EXTENSION} from './blockDefinitions/whenSpriteDropped';
import {
  ExternalSceneDropdown,
  FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE,
} from './externalSceneDropdown';
import {
  FIELD_GRID_SINGLE_TYPE,
  FIELD_GRID_TYPE,
  GridField,
  GridSingleField,
} from './gridFields';
import {
  animationPicker,
  BlockImageField,
  CostumeField,
  FIELD_BLOCK_IMAGE_TYPE,
  FIELD_COSTUME_TYPE,
} from './imagePickerFields';
import {PREDICT_MUTATOR, predictMutator} from './predictMutator';

// blocksCommon is a plain CommonJS module (exports.install = ...); give it a
// minimal typed view.
const blocksCommon = blocksCommonModule as unknown as {
  install: (blockly: unknown, options: object) => void;
};

// StudioApp-free equivalent of appMain.js's block install. Relies on Sprite
// Lab's own install() because it also wires the behavior FunctionEditor and
// custom procedure blocks.
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
  installLabBlocks();
  isSetup = true;
}

function installLabBlocks(): void {
  if (Blockly.Blocks[GO_TO_SCENE_BLOCK_TYPE]) {
    return;
  }
  Blockly.fieldRegistry.register(FIELD_SCENE_DROPDOWN_TYPE, SceneDropdown);
  Blockly.fieldRegistry.register(
    FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE,
    ExternalSceneDropdown
  );
  Blockly.fieldRegistry.register(FIELD_COSTUME_TYPE, CostumeField);
  Blockly.fieldRegistry.register(FIELD_BLOCK_IMAGE_TYPE, BlockImageField);
  Blockly.fieldRegistry.register(FIELD_GRID_TYPE, GridField);
  Blockly.fieldRegistry.register(FIELD_GRID_SINGLE_TYPE, GridSingleField);
  BlocklyCore.Extensions.registerMutator(PREDICT_MUTATOR, predictMutator);
  // An event hat generates the blocks below it as its handler body.
  BlocklyCore.Extensions.register(
    EVENT_HAT_EXTENSION,
    function (this: ExtendedBlock) {
      this.skipNextBlockGeneration = true;
    }
  );
  for (const {definition, generator} of labBlockDefinitions) {
    Blockly.Blocks[definition.type] = {
      init: function (this: BlocklyCore.Block) {
        this.jsonInit(definition);
      },
    };
    Blockly.getGenerator().forBlock[definition.type] = generator;
  }
}

/**
 * Install the level's DB-backed block pool; returns category -> block type
 * names. Lab-owned blocks install via installLabBlocks, not here.
 */
export function installSharedBlocks(sharedBlocks: BlockDefinition[]): {
  [category: string]: string[];
} {
  return blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: sharedBlocks || [],
    customInputTypes: {
      ...(spritelabBlocks.customInputTypes as unknown as CustomInputTypes),
      // Lab2 pickers: trim-aware costume thumbnails (backgrounds stay
      // untrimmed), an intentional empty state, and a button to the
      // Images tab.
      costumePicker: animationPicker('costume'),
      backgroundPicker: animationPicker('background'),
      blockPicker: animationPicker('block'),
    } as unknown as CustomInputTypes,
  });
}
