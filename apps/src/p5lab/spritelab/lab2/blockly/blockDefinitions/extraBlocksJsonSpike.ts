// SPIKE (not shipped): what extraSharedBlocks.ts looks like in the modern
// JSON block format, for comparison on PR #73973. Two representative blocks:
// the simplest behavior and the hardest composite.
//
// What the conversion buys: declarative, typechecked definitions; standalone
// generators; no dependency on block_utils' config interpreter.
// What it still needs regardless of format:
//   1. Registered field wrappers — neither CdoFieldAnimationDropdown nor
//      CdoFieldBitmap has fromJson, so JSON definitions can't reference them
//      until we register wrapper types (SceneDropdown pattern).
//   2. A helperCode side-channel — the behaviors/composites are interpreted
//      runtime code; JSON has no slot for it, so the engine still needs a
//      blockType -> helperCode registry to prepend, same as today.
//   3. animationOptions/MAKE_IMAGE_BUTTONS move out of setup.ts (which
//      imports this directory — keeping them there would be a cycle).

import * as BlocklyCore from 'blockly/core';

import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {CdoFieldBitmap} from '@cdo/apps/blockly/addons/cdoFieldBitmap';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

// Placeholder for setup.ts's animationOptions/MAKE_IMAGE_BUTTONS after they
// move to their own module (seam 3 above).
declare function costumeOptions(): [string, string][];
declare const MAKE_IMAGE_BUTTONS: {
  text: string;
  action: () => void;
  className: string;
}[];

export const FIELD_COSTUME_TYPE = 'field_spritelab2_costume';
export const FIELD_GRID_TYPE = 'field_spritelab2_grid';
// FieldJson is a closed type — a custom 'single' property doesn't typecheck,
// so the single-cell variant is its own registered field type.
export const FIELD_GRID_SINGLE_TYPE = 'field_spritelab2_grid_single';

// Seam 1: fromJson wrappers, registered in setup.ts alongside SceneDropdown.
export class CostumeField extends CdoFieldAnimationDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new CostumeField(() => costumeOptions(), 32, 32, MAKE_IMAGE_BUTTONS);
  }
}

const GRID_CONFIG = {
  height: 8,
  width: 8,
  fieldHeight: 42,
  // Both keys: the plugin's Buttons type requires them (classic blocks.js
  // passes {randomize: false} unchecked from JS).
  buttons: {randomize: false, clear: true},
};

// Single-select: a new mark replaces the old one (from blocks.js's
// bitmapSingle validator).
function singleCellValidator(newValue: number[][]): number[][] {
  let marks = 0;
  return newValue.map(row => row.map(cell => (cell && ++marks === 1 ? 1 : 0)));
}

export class GridField extends CdoFieldBitmap {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    // SKIP_SETUP, not null: FieldBitmap's TS constructor rejects null (the
    // classic blocks.js call passes it unchecked from JS).
    return new GridField(BlocklyCore.Field.SKIP_SETUP, undefined, GRID_CONFIG);
  }
}

export class GridSingleField extends CdoFieldBitmap {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new GridSingleField(
      BlocklyCore.Field.SKIP_SETUP,
      singleCellValidator,
      GRID_CONFIG
    );
  }
}

// --- spritelab2_movingLeft ---------------------------------------------

const movingLeftDefinition: BlockJson = {
  type: 'spritelab2_movingLeft',
  message0: 'moving left',
  output: 'Behavior',
  style: BlockStyles.BEHAVIOR,
};

const movingLeftGenerator: GeneratorFunction = () => [
  'movingLeft()',
  2 /* Order.FUNCTION_CALL */,
];

// Seam 2: identical to today's helperCode, delivered via a new
// blockType -> helperCode registry the engine prepends.
const movingLeftHelper = [
  'function movingLeft() {',
  '  return {',
  '    func: function (spriteId) {',
  '      moveInDirection(spriteId, 2, "West");',
  '    },',
  "    name: 'moving left',",
  '  };',
  '}',
].join('\n');

// --- spritelab2_makePlatformPlayer --------------------------------------

const makePlatformPlayerDefinition: BlockJson = {
  type: 'spritelab2_makePlatformPlayer',
  message0: 'make platform player %1 at grid location: %2',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    {type: FIELD_GRID_SINGLE_TYPE, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  // BlockStyles has no 'sprite_blocks' entry — a real conversion adds
  // SPRITE = 'sprite_blocks' to the enum (the theme defines the style).
  style: BlockStyles.DEFAULT,
};

// The costume field's option values are pre-quoted ('"name"'), matching the
// classic picker, so the field value drops into the call as-is.
const makePlatformPlayerGenerator: GeneratorFunction = block =>
  `makePlatformPlayer(${block.getFieldValue('ANIMATION_NAME')}, ` +
  `'${JSON.stringify(block.getFieldValue('GRID'))}');\n`;

// (makePlatformPlayer's ~25-line interpreted helper is unchanged from
// extraSharedBlocks.ts — elided here.)

export default [
  {
    definition: movingLeftDefinition,
    generator: movingLeftGenerator,
    helperCode: movingLeftHelper,
  },
  {
    definition: makePlatformPlayerDefinition,
    generator: makePlatformPlayerGenerator,
  },
];
