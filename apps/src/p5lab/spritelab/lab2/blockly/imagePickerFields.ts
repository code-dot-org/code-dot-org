// The project-image dropdowns (costume / background / block), shared by two
// block-definition systems: DB pool blocks reference them as customInputTypes
// (animationPicker), lab-owned JSON definitions as registered field types
// (CostumeField / BlockImageField).

import * as BlocklyCore from 'blockly/core';

import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {animationSourceUrl} from '@cdo/apps/p5lab/redux/animationList';
import {getStore} from '@cdo/apps/redux';

import {getTrimmedThumbnail} from '../imageTrim';
import {setActiveTab} from '../redux/spriteLab2Redux';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';

import moduleStyles from './image-dropdown.module.scss';

export const FIELD_COSTUME_TYPE = 'field_spritelab2_costume';
export const FIELD_BLOCK_IMAGE_TYPE = 'field_spritelab2_block_image';

// The neutral-gray design-token value, copied because an SVG data URI can't
// read CSS variables.
const EMPTY_TILE_STROKE = '#a0a6b2';

// Shown when the project has no matching images yet: an "add an image" tile
// (Blockly dropdowns cannot have zero options). Selecting it generates the
// no-op value `null`.
const EMPTY_IMAGE_OPTION: [string, string][] = [
  [
    'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
          '<rect x="4" y="6" width="32" height="28" rx="3" fill="none"' +
          ` stroke="${EMPTY_TILE_STROKE}" stroke-width="2"` +
          ' stroke-dasharray="4 3"/>' +
          '</svg>'
      ),
    'null',
  ],
];

// One button below the image grid: jump to the Images tab, where images are
// made. Doubles as the empty state's affordance.
const MAKE_IMAGE_BUTTONS = [
  {
    text: 'Make an image',
    action: () => getStore().dispatch(setActiveTab('Images')),
    className: moduleStyles.makeImageButton,
  },
];

type AnimationKind = 'costume' | 'background' | 'block';

// Thumbnail sizes in the dropdown grid, matching classic blocks.js.
const THUMBNAIL_SIZE: Record<AnimationKind, number> = {
  costume: 32,
  background: 40,
  block: 32,
};

// Thumbnail options for one kind of animation, filtered by image category:
// backgrounds and blocks each list only their own category, costumes list
// everything else. Costumes prefer the border-trimmed image (see imageTrim.ts)
// so the sprite's content fills the field instead of floating in its
// transparent margins. Mirrors the classic costumeList/backgroundList in
// spritelab/blocks.js otherwise.
function animationOptions(kind: AnimationKind): [string, string][] {
  const state = getStore().getState();
  const animationList = state.animationList;
  if (!animationList) {
    return EMPTY_IMAGE_OPTION;
  }
  const kindOf = (categories: string[]): AnimationKind =>
    categories.includes(BACKGROUNDS_CATEGORY)
      ? 'background'
      : categories.includes(BLOCKS_CATEGORY)
      ? 'block'
      : 'costume';
  const results: [string, string][] = [];
  animationList.orderedKeys.forEach((key: string) => {
    const animation = animationList.propsByKey[key];
    if (kindOf(animation.categories || []) !== kind) {
      return;
    }
    const url =
      (kind === 'background'
        ? undefined
        : getTrimmedThumbnail(animation.name)) ||
      animation.sourceUrl ||
      animationSourceUrl(key, animation, state.pageConstants?.channelId);
    results.push([url, `"${animation.name}"`]);
  });
  return results.length ? results : EMPTY_IMAGE_OPTION;
}

function animationDropdown(
  kind: AnimationKind,
  Ctor: typeof CdoFieldAnimationDropdown = CdoFieldAnimationDropdown
): CdoFieldAnimationDropdown {
  return new Ctor(
    () => animationOptions(kind),
    THUMBNAIL_SIZE[kind],
    THUMBNAIL_SIZE[kind],
    MAKE_IMAGE_BUTTONS
  );
}

// The classic costumePicker/backgroundPicker input types, with lab2's empty
// state and Images-tab button. (The classic animation-mode buttons don't
// apply here — this lab has no AnimationTab.)
export function animationPicker(kind: AnimationKind) {
  return {
    addInput(
      blockly: unknown,
      block: BlocklyCore.Block,
      inputConfig: {name: string; label: string},
      currentInputRow: BlocklyCore.Input
    ) {
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(animationDropdown(kind), inputConfig.name);
    },
    generateCode(block: BlocklyCore.Block, arg: {name: string}) {
      return block.getFieldValue(arg.name);
    },
  };
}

// Registered field types (see setup.ts) so JSON block definitions get the
// same dropdowns.
export class CostumeField extends CdoFieldAnimationDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return animationDropdown('costume', CostumeField);
  }
}

export class BlockImageField extends CdoFieldAnimationDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return animationDropdown('block', BlockImageField);
  }
}

/**
 * Refresh every costume dropdown's thumbnail, so blocks rendered before an
 * image was trimmed pick up the trim.
 */
export function refreshAnimationDropdownThumbnails(): void {
  const workspace = Blockly.getMainWorkspace?.();
  if (!workspace) {
    return;
  }
  workspace.getAllBlocks(false).forEach((block: BlocklyCore.Block) => {
    block.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (field instanceof CdoFieldAnimationDropdown) {
          field.refreshSelectedOption();
        }
      });
    });
  });
}
