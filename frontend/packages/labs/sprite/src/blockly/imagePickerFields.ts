// The project-image dropdowns (costume / background / block), shared by two
// block-definition systems: DB pool blocks reference them as customInputTypes
// (animationPicker), lab-owned JSON definitions as registered field types
// (CostumeField / BlockImageField).

import * as BlocklyCore from 'blockly/core';

import {PluginType, type FieldPlugin} from '@code-dot-org/blockly/plugins';

import {type ImageType} from '../ai/images/types';
import {noteImageFieldValue} from '../imageReferences';
import {defaultImageName, type ImageSlot} from '../imageRoleDefaults';
import {getImageThumbnail} from '../imageTrim';
import {setActiveTab} from '../redux/spriteLab2Redux';
import store from '../redux/store';
import {
  BACKGROUNDS_CATEGORY,
  BLOCKS_CATEGORY,
  type SpriteLab2LevelProperties,
} from '../types';

import CdoFieldAnimationDropdown from './fields/cdoFieldAnimationDropdown';
import {getImageSource} from './imageSource';

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
          '</svg>',
      ),
    'null',
  ],
];

// One button below the image grid: jump to the Images tab, where images are
// made. Doubles as the empty state's affordance.
const MAKE_IMAGE_BUTTONS = [
  {
    text: 'Make an image',
    action: () => store.dispatch(setActiveTab('Images')),
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

// Thumbnail options for one kind of animation, filtered by image category.
// Costumes and blocks prefer the border-trimmed image (imageTrim.ts) so the
// content fills the field instead of floating in its transparent margins.
function animationOptions(kind: AnimationKind): [string, string][] {
  const imageSource = getImageSource();
  const animationList = imageSource?.animationList();
  if (!imageSource || !animationList) {
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
      getImageThumbnail(animation.name) ||
      animation.sourceUrl ||
      imageSource.imageUrl(key, animation);
    results.push([url, `"${animation.name}"`]);
  });
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
    return {blockType: block.type, index: 0};
  }
  const sockets = parent.inputList.filter(input =>
    input.connection?.getCheck()?.includes(SPRITE_CHECK),
  );
  return {
    blockType: parent.type,
    index: Math.max(0, sockets.indexOf(parentInput)),
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
    const animationList = getImageSource()?.animationList();
    if (!block || !animationList) {
      return;
    }
    const levelProperties = store.getState().lab.levelProperties as
      | SpriteLab2LevelProperties
      | undefined;
    const name = defaultImageName(
      animationList,
      levelProperties?.imageRoleDefaults,
      IMAGE_TYPE_OF[this.kind],
      slotOf(block),
    );
    if (name) {
      this.setValue(`"${name}"`);
    }
  }
}

function animationDropdown(
  kind: AnimationKind,
  Ctor: typeof Lab2AnimationDropdown = Lab2AnimationDropdown,
): Lab2AnimationDropdown {
  const field = new Ctor(
    () => animationOptions(kind),
    THUMBNAIL_SIZE[kind],
    THUMBNAIL_SIZE[kind],
    MAKE_IMAGE_BUTTONS,
  );
  field.kind = kind;
  return field;
}

// The classic costumePicker/backgroundPicker input types, with lab2's empty
// state and Images-tab button. (The classic animation-mode buttons don't
// apply here — this lab has no AnimationTab.)
export function animationPicker(kind: AnimationKind) {
  return {
    addInput(
      _blockly: unknown,
      _block: BlocklyCore.Block,
      inputConfig: {name: string; label: string},
      currentInputRow: BlocklyCore.Input,
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
  static fromJson() {
    return animationDropdown('costume', CostumeField);
  }
}

export const COSTUME_FIELD: FieldPlugin = {
  type: PluginType.Field,
  name: FIELD_COSTUME_TYPE,
  field: CostumeField,
};

export class BlockImageField extends Lab2AnimationDropdown {
  static fromJson() {
    return animationDropdown('block', BlockImageField);
  }
}

export const BLOCK_IMAGE_FIELD: FieldPlugin = {
  type: PluginType.Field,
  name: FIELD_BLOCK_IMAGE_TYPE,
  field: BlockImageField,
};

/**
 * Refresh every image dropdown against the current list: thumbnails that
 * landed after a block rendered, and values whose image is gone. The
 * flyout's blocks too: a flyout-only toolbox builds them at injection,
 * before any image has loaded.
 */
export function refreshAnimationDropdownThumbnails(): void {
  const workspace = BlocklyCore.getMainWorkspace() as
    | BlocklyCore.WorkspaceSvg
    | undefined;
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
