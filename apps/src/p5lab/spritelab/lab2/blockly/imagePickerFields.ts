// The project-image dropdowns (costume / background / block), shared by two
// block-definition systems: DB pool blocks reference them as customInputTypes
// (animationPicker), lab-owned JSON definitions as registered field types
// (CostumeField / BlockImageField).

import * as BlocklyCore from 'blockly/core';

import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {animationSourceUrl} from '@cdo/apps/p5lab/redux/animationList';
import {getStore} from '@cdo/apps/redux';

import {ImageType} from '../ai/images/types';
import {noteImageFieldValue} from '../imageReferences';
import {defaultImageName, ImageSlot} from '../imageRoleDefaults';
import {getImageThumbnail} from '../imageTrim';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';

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

type AnimationKind = 'costume' | 'background' | 'block';

// Thumbnail sizes in the dropdown grid, matching classic blocks.js.
const THUMBNAIL_SIZE: Record<AnimationKind, number> = {
  costume: 32,
  background: 40,
  block: 32,
};

/** The pool's "when touches" block: its sprite picker lists sprites, then
    platform blocks. Touching a block from any side counts. */
export const TOUCHING_BLOCK_TYPE = 'gamelab_checkTouching';

// Thumbnail options for one kind of animation, filtered by image category.
// Costumes and blocks prefer the border-trimmed image (imageTrim.ts) so the
// content fills the field instead of floating in its transparent margins.
// `withBlocks` appends the block images after a costume picker's sprites.
function animationOptions(
  kind: AnimationKind,
  withBlocks = false
): [string, string][] {
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
  const optionsOf = (wanted: AnimationKind): [string, string][] => {
    const results: [string, string][] = [];
    animationList.orderedKeys.forEach((key: string) => {
      const animation = animationList.propsByKey[key];
      if (kindOf(animation.categories || []) !== wanted) {
        return;
      }
      const url =
        getImageThumbnail(animation.name) ||
        animation.sourceUrl ||
        animationSourceUrl(key, animation, state.pageConstants?.channelId);
      results.push([url, `"${animation.name}"`]);
    });
    return results;
  };
  const results = withBlocks
    ? [...optionsOf(kind), ...optionsOf('block')]
    : optionsOf(kind);
  return results.length ? results : EMPTY_IMAGE_OPTION;
}

const IMAGE_TYPE_OF: Record<AnimationKind, ImageType> = {
  costume: 'sprite',
  background: 'background',
  block: 'block',
};

// Sprite sockets take a "sprite with costume" shadow; the connection check
// is how a parent's sockets are told apart from its other inputs.
const SPRITE_CHECK = 'Sprite';

/**
 * Where a field sits for image_role_defaults: its block, or, on a shadow
 * filling a sprite socket, the parent block and the socket's position among
 * the parent's sprite sockets.
 */
function slotOf(block: BlocklyCore.Block): ImageSlot {
  const parentInput =
    block.outputConnection?.targetConnection?.getParentInput();
  const parent = block.getParent();
  if (!parentInput || !parent) {
    return {blockType: block.type, index: 0, data: block.data ?? undefined};
  }
  const sockets = parent.inputList.filter(input =>
    input.connection?.getCheck()?.includes(SPRITE_CHECK)
  );
  return {
    blockType: parent.type,
    index: Math.max(0, sockets.indexOf(parentInput)),
    data: parent.data ?? undefined,
  };
}

/**
 * The lab's image dropdown. A fresh field starts on the image the level's
 * image_role_defaults name for its slot, decided once the field is on its
 * block; a saved block's own value wins, and a level naming nothing leaves
 * the newest image, Blockly's first option.
 */
export class Lab2AnimationDropdown extends CdoFieldAnimationDropdown {
  kind: AnimationKind = 'costume';
  private valueLoaded = false;

  // A saved value names an image; one the project no longer has (or a
  // toolbox's placeholder) fails validation and leaves the constructor's
  // choice, which is no choice at all, so the level default still applies.
  loadState(state: unknown) {
    super.loadState(state);
    const saved =
      typeof state === 'string' && /<field/.test(state)
        ? BlocklyCore.utils.xml.textToDom(state).textContent
        : state;
    this.valueLoaded = this.getValue() === saved;
  }

  fromXml(element: Element) {
    super.fromXml(element);
    this.valueLoaded = this.getValue() === element.textContent;
  }

  init() {
    super.init();
    this.takeLevelDefault();
  }

  /** Starts the field on the level's default image, unless a saved value
      was loaded into it. */
  takeLevelDefault() {
    if (!this.valueLoaded) {
      this.applyLevelDefault();
    }
  }

  /**
   * After the image list changed: a value the list lost gives way to the
   * level default, else the first option; a kept value refreshes its
   * thumbnail.
   */
  followList() {
    const options = this.getOptions(false);
    if (options.some(([, value]) => value === this.getValue())) {
      this.refreshSelectedOption();
      return;
    }
    this.valueLoaded = false;
    this.setValue(options[0][1]);
    this.applyLevelDefault();
    this.forceRerender();
  }

  private applyLevelDefault() {
    const block = this.getSourceBlock();
    if (!block) {
      return;
    }
    const state = getStore().getState();
    const name = defaultImageName(
      state.animationList,
      state.lab?.levelProperties?.imageRoleDefaults,
      IMAGE_TYPE_OF[this.kind],
      slotOf(block)
    );
    if (name) {
      this.setValue(`"${name}"`);
    }
  }
}

function animationDropdown(
  kind: AnimationKind,
  Ctor: typeof Lab2AnimationDropdown = Lab2AnimationDropdown
): Lab2AnimationDropdown {
  // The constructor asks for options before the field exists.
  const made: {field?: Lab2AnimationDropdown} = {};
  const field: Lab2AnimationDropdown = new Ctor(
    () =>
      animationOptions(
        kind,
        kind === 'costume' &&
          made.field?.getSourceBlock()?.getParent()?.type ===
            TOUCHING_BLOCK_TYPE
      ),
    THUMBNAIL_SIZE[kind],
    THUMBNAIL_SIZE[kind],
    undefined
  );
  made.field = field;
  field.kind = kind;
  return field;
}

// The classic costumePicker/backgroundPicker input types, with lab2's empty
// state. (The classic animation-mode buttons don't
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
      // Registers the name for the scene preload's reference set.
      return noteImageFieldValue(block.getFieldValue(arg.name));
    },
  };
}

// Registered field types (see setup.ts) so JSON block definitions get the
// same dropdowns.
export class CostumeField extends Lab2AnimationDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return animationDropdown('costume', CostumeField);
  }
}

export class BlockImageField extends Lab2AnimationDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return animationDropdown('block', BlockImageField);
  }
}

const imageDropdownsOn = (
  workspace: BlocklyCore.Workspace
): Lab2AnimationDropdown[] =>
  workspace
    .getAllBlocks(false)
    .flatMap(block => block.inputList)
    .flatMap(input => input.fieldRow)
    .filter(
      (field): field is Lab2AnimationDropdown =>
        field instanceof Lab2AnimationDropdown
    );

/**
 * Starts every image dropdown of a workspace that is never shown on the
 * level's default image. Blockly calls a field's `init` only on a workspace
 * it draws, so on any other workspace the dropdowns would stay on the
 * newest image.
 */
export function takeLevelDefaults(workspace: BlocklyCore.Workspace): void {
  imageDropdownsOn(workspace).forEach(field => field.takeLevelDefault());
}

/**
 * Refresh every image dropdown against the current list: thumbnails that
 * landed after a block rendered, and values whose image is gone. The
 * flyout's blocks too: a flyout-only toolbox builds them at injection,
 * before any image has loaded.
 */
export function refreshAnimationDropdownThumbnails(): void {
  const workspace: BlocklyCore.WorkspaceSvg | undefined =
    Blockly.getMainWorkspace?.();
  if (!workspace) {
    return;
  }
  const flyouts = [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()];
  const workspaces = [
    workspace,
    ...flyouts.map(flyout => flyout?.getWorkspace()),
  ];
  workspaces.forEach(ws => {
    ws?.getAllBlocks(false).forEach((block: BlocklyCore.Block) => {
      block.inputList.forEach(input => {
        input.fieldRow.forEach(field => {
          if (field instanceof Lab2AnimationDropdown) {
            field.followList();
          }
        });
      });
    });
  });
}
