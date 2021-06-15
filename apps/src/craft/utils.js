import i18n from './locale';
import {getStore} from '@cdo/apps/redux';
import {setPlayerSelectionDialog} from '@cdo/apps/craft/redux';

export const ARROW_KEY_NAMES = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Left',
  'Right',
  'Up',
  'Down'
];

/**
 * provides a mapping from the block name as used by things like the Blockly
 * placeBlock configuration to the internationalized display name
 */
export const BLOCK_NAME_TO_DISPLAY_TEXT = {
  '': i18n.blockTypeEmpty(),
  bedrock: i18n.blockTypeBedrock(),
  bricks: i18n.blockTypeBricks(),
  clay: i18n.blockTypeClay(),
  clayHardened: i18n.blockTypeClayHardened(),
  cobblestone: i18n.blockTypeCobblestone(),
  dirt: i18n.blockTypeDirt(),
  dirtCoarse: i18n.blockTypeDirtCoarse(),
  doorIron: i18n.blockTypeDoorIron(),
  farmlandWet: i18n.blockTypeFarmlandWet(),
  glass: i18n.blockTypeGlass(),
  glowstone: i18n.blockTypeGlowstone(),
  grass: i18n.blockTypeGrass(),
  gravel: i18n.blockTypeGravel(),
  ice: i18n.blockTypeIce(),
  lava: i18n.blockTypeLava(),
  logAcacia: i18n.blockTypeLogAcacia(),
  logBirch: i18n.blockTypeLogBirch(),
  logJungle: i18n.blockTypeLogJungle(),
  logOak: i18n.blockTypeLogOak(),
  logSpruce: i18n.blockTypeLogSpruce(),
  netherBrick: i18n.blockTypeNetherBrick(),
  netherrack: i18n.blockTypeNetherrack(),
  oreCoal: i18n.blockTypeOreCoal(),
  oreDiamond: i18n.blockTypeOreDiamond(),
  oreEmerald: i18n.blockTypeOreEmerald(),
  oreGold: i18n.blockTypeOreGold(),
  oreIron: i18n.blockTypeOreIron(),
  oreLapis: i18n.blockTypeOreLapis(),
  oreRedstone: i18n.blockTypeOreRedstone(),
  planksAcacia: i18n.blockTypePlanksAcacia(),
  planksBirch: i18n.blockTypePlanksBirch(),
  planksJungle: i18n.blockTypePlanksJungle(),
  planksOak: i18n.blockTypePlanksOak(),
  planksSpruce: i18n.blockTypePlanksSpruce(),
  pressurePlateUp: i18n.blockTypePressurePlateUp(),
  rail: i18n.blockTypeRail(),
  railsRedstoneTorch: i18n.blockTypeRailsRedstoneTorch(),
  redstoneWire: i18n.blockTypeRedstoneWire(),
  sand: i18n.blockTypeSand(),
  sandstone: i18n.blockTypeSandstone(),
  snow: i18n.blockTypeSnow(),
  stone: i18n.blockTypeStone(),
  tnt: i18n.blockTypeTnt(),
  tree: i18n.blockTypeTree(),
  water: i18n.blockTypeWater(),
  wool: i18n.blockTypeWool(),
  wool_blue: i18n.blockTypeWoolBlue(),
  wool_magenta: i18n.blockTypeWoolMagenta(),
  wool_orange: i18n.blockTypeWoolOrange(),
  wool_pink: i18n.blockTypeWoolPink(),
  wool_red: i18n.blockTypeWoolRed(),
  wool_yellow: i18n.blockTypeWoolYellow()
};

/**
 * Converts an array of blockTypes into a blockly-friendly set of dropdown
 * options, in the form of [[displayName, blockType], ...]
 *
 * displayName will be the internationalized user-friendly name for the block
 * if it exists, and the raw blockType if it does not.
 *
 * @param {string[]} blockTypes
 * @returns {Array.<Array.<String>>} - an array of [displayName, blockType] pairs
 */
export function blockTypesToDropdownOptions(blockTypes) {
  return blockTypes.map(function(blockType) {
    const displayName = BLOCK_NAME_TO_DISPLAY_TEXT[blockType] || blockType;
    return [displayName, blockType];
  });
}

export function openPlayerSelectionDialog(onSelectedCallback) {
  getStore().dispatch(setPlayerSelectionDialog(true, onSelectedCallback));
}

export function closePlayerSelectionDialog() {
  getStore().dispatch(setPlayerSelectionDialog(false));
}
