import * as BlocklyCore from 'blockly/core';

import * as blockUtils from '@cdo/apps/block_utils';
import {BlockDefinition, CustomInputTypes} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';

import labBlockDefinitions from './blockDefinitions';
import {
  FIELD_SCENE_DROPDOWN_TYPE,
  GO_TO_SCENE_BLOCK_TYPE,
  SceneDropdown,
} from './blockDefinitions/goToScene';
import {
  PLACEHOLDER_CLASS,
  PLACEHOLDER_MUTATOR,
  PLACEHOLDER_OUTLINE_EXTENSION,
  placeholderMutator,
} from './blockDefinitions/placeholder';
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
import {
  FIELD_MUSIC_PROJECT_DROPDOWN_TYPE,
  MusicProjectDropdown,
} from './musicProjectDropdown';

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
  Blockly.fieldRegistry.register(
    FIELD_MUSIC_PROJECT_DROPDOWN_TYPE,
    MusicProjectDropdown
  );
  Blockly.fieldRegistry.register(FIELD_COSTUME_TYPE, CostumeField);
  Blockly.fieldRegistry.register(FIELD_BLOCK_IMAGE_TYPE, BlockImageField);
  Blockly.fieldRegistry.register(FIELD_GRID_TYPE, GridField);
  Blockly.fieldRegistry.register(FIELD_GRID_SINGLE_TYPE, GridSingleField);
  BlocklyCore.Extensions.register(
    PLACEHOLDER_OUTLINE_EXTENSION,
    placeholderOutline
  );
  BlocklyCore.Extensions.registerMutator(
    PLACEHOLDER_MUTATOR,
    placeholderMutator
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

let placeholderCount = 0;

// Blockly draws a shadow with no stroke; the class restores one, dashed
// (cdoCss.ts), once the block has an SVG to carry it. The path clips its
// own stroke to its inside, so the dashes never cross the block above.
// Sizing happens after the workspace loads (placeholders.ts).
function placeholderOutline(this: BlocklyCore.Block) {
  // Headless blocks (code generation, tests) have no SVG to draw.
  if (!(this instanceof BlocklyCore.BlockSvg)) {
    return;
  }
  const initSvg = this.initSvg.bind(this);
  const dispose = this.dispose.bind(this);
  let clip: SVGClipPathElement | null = null;
  this.initSvg = () => {
    initSvg();
    this.getSvgRoot().classList.add(PLACEHOLDER_CLASS);
    const defs = this.workspace.getParentSvg().querySelector('defs');
    if (clip || !defs) {
      return;
    }
    const id = `spritelab2-placeholder-${placeholderCount++}`;
    const path = this.pathObject.svgPath;
    path.setAttribute('id', `${id}-path`);
    clip = BlocklyCore.utils.dom.createSvgElement(
      BlocklyCore.utils.Svg.CLIPPATH,
      {id},
      defs
    );
    BlocklyCore.utils.dom.createSvgElement('use', {href: `#${id}-path`}, clip);
    path.setAttribute('clip-path', `url(#${id})`);
  };
  this.dispose = (...args) => {
    clip?.remove();
    clip = null;
    dispose(...args);
  };
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
