import * as BlocklyCore from 'blockly/core';

import * as blockUtils from '@cdo/apps/block_utils';
import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {
  BlockDefinition,
  CustomInputTypes,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import {animationSourceUrl} from '@cdo/apps/p5lab/redux/animationList';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';
import {getStore} from '@cdo/apps/redux';

import {SCENES_UI_VARIANT} from '../experiments';
import {getTrimmedThumbnail} from '../imageTrim';
import {setActiveTab} from '../redux/spriteLab2Redux';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';

import sceneBlockDefinitions from './blockDefinitions';
import {GO_TO_EXTERNAL_SCENE_BLOCK_TYPE} from './blockDefinitions/goToExternalScene';
import {
  FIELD_SCENE_DROPDOWN_TYPE,
  GO_TO_SCENE_BLOCK_TYPE,
  SceneDropdown,
} from './blockDefinitions/goToScene';
import {
  ExternalSceneDropdown,
  FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE,
} from './externalSceneDropdown';
import {SPRITELAB2_EXTRA_SHARED_BLOCKS} from './extraSharedBlocks';

import moduleStyles from './image-dropdown.module.scss';

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
  if (SCENES_UI_VARIANT) {
    installSceneBlocks();
  }
  isSetup = true;
}

function installSceneBlocks(): void {
  if (Blockly.Blocks[GO_TO_SCENE_BLOCK_TYPE]) {
    return;
  }
  Blockly.fieldRegistry.register(FIELD_SCENE_DROPDOWN_TYPE, SceneDropdown);
  Blockly.fieldRegistry.register(
    FIELD_EXTERNAL_SCENE_DROPDOWN_TYPE,
    ExternalSceneDropdown
  );
  for (const {definition, generator} of sceneBlockDefinitions) {
    Blockly.Blocks[definition.type] = {
      init: function (this: BlocklyCore.Block) {
        this.jsonInit(definition);
      },
    };
    Blockly.getGenerator().forBlock[definition.type] = generator;
  }
}

/**
 * Append the scene blocks to the "Game Design" category. No-op when the
 * variant is off or the category is absent.
 */
export function ensureSceneBlocks(toolboxXml: string): string {
  if (!SCENES_UI_VARIANT) {
    return toolboxXml;
  }
  try {
    const doc = new DOMParser().parseFromString(toolboxXml, 'text/xml');
    const category = Array.from(
      doc.getElementsByTagNameNS('*', 'category')
    ).find(c => c.getAttribute('name') === 'Game Design');
    if (!category) {
      return toolboxXml;
    }
    const present = new Set(
      Array.from(category.getElementsByTagNameNS('*', 'block')).map(b =>
        b.getAttribute('type')
      )
    );
    [GO_TO_SCENE_BLOCK_TYPE, GO_TO_EXTERNAL_SCENE_BLOCK_TYPE].forEach(type => {
      if (!present.has(type)) {
        const block = doc.createElementNS(category.namespaceURI, 'block');
        block.setAttribute('type', type);
        category.appendChild(block);
      }
    });
    return new XMLSerializer().serializeToString(doc);
  } catch {
    return toolboxXml;
  }
}

// Sensible toolbox defaults for the platformer composites: the player marked
// mid-air above a full bottom-row floor.
const PLATFORMER_GRID_SIZE = 8;
function platformerGrid(mark: (row: number, col: number) => 0 | 1): string {
  return JSON.stringify(
    Array.from({length: PLATFORMER_GRID_SIZE}, (_, row) =>
      Array.from({length: PLATFORMER_GRID_SIZE}, (_, col) => mark(row, col))
    )
  );
}

// [block type, default GRID field] for the two composites, player first.
const PLATFORMER_COMPOSITES: [string, string][] = [
  [
    'spritelab2_makePlatformPlayer',
    platformerGrid((row, col) => (row === 4 && col === 3 ? 1 : 0)),
  ],
  [
    'spritelab2_makePlatformBlocks',
    platformerGrid(row => (row === PLATFORMER_GRID_SIZE - 1 ? 1 : 0)),
  ],
];

// Lab-injected toolbox categories, inserted in this order at the top of every
// level's toolbox. Each lists its lineup in display order. Entries already in
// the toolbox elsewhere are cloned (keeping their curated shadows/defaults);
// otherwise a bare block is created with its field defaults. A category a
// level already curates itself is left alone (per-type dedupe).
const INJECTED_CATEGORIES: {name: string; types: string[]}[] = [
  {
    // The platformer composites plus the core event blocks.
    name: 'Platform',
    types: [
      'spritelab2_makePlatformPlayer',
      'spritelab2_makePlatformBlocks',
      'gamelab_setBackgroundImageAs',
      'gamelab_spriteClicked',
      'gamelab_checkTouching',
      'gamelab_atTime',
      'gamelab_spriteSay',
      GO_TO_SCENE_BLOCK_TYPE,
      GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
    ],
  },
  {
    // Scene-driven storytelling: place and size characters, speech, click and
    // timer events, scene jumps, and the simple movement behaviors.
    name: 'Story',
    types: [
      'gamelab_setBackgroundImageAs',
      'gamelab_makeNewSpriteAnon',
      'gamelab_setProp',
      'gamelab_spriteSay',
      'gamelab_spriteSayTime',
      'gamelab_spriteClicked',
      GO_TO_SCENE_BLOCK_TYPE,
      GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
      'gamelab_atTime',
      'gamelab_addBehaviorSimple',
      'spritelab2_movingLeft',
      'spritelab2_patrollingLeftRight',
    ],
  },
];

/**
 * Lab toolbox additions: lead the "Sprites" category with the platformer
 * composites, and build the injected categories (Platform, Story, ...) at the
 * top of the toolbox (toolbox categories reference block types, so a block
 * can appear in any number of them). The composites are lab-owned blocks
 * (extraSharedBlocks), so DB-authored toolboxes don't know them; per-type
 * dedupe leaves alone whatever a level curates itself.
 */
export function ensurePlatformerBlocks(toolboxXml: string): string {
  try {
    const doc = new DOMParser().parseFromString(toolboxXml, 'text/xml');
    const categories = Array.from(doc.getElementsByTagNameNS('*', 'category'));
    const sprites = categories.find(c => c.getAttribute('name') === 'Sprites');
    if (!sprites) {
      return toolboxXml;
    }
    const compositeGrids = new Map(PLATFORMER_COMPOSITES);

    // A new block element: the composites carry their GRID defaults, anything
    // else starts bare (fields initialize to their own defaults).
    const makeBlock = (type: string) => {
      const block = doc.createElementNS(sprites.namespaceURI, 'block');
      block.setAttribute('type', type);
      const grid = compositeGrids.get(type);
      if (grid) {
        const field = doc.createElementNS(sprites.namespaceURI, 'field');
        field.setAttribute('name', 'GRID');
        field.textContent = grid;
        block.appendChild(field);
      }
      return block;
    };
    // Prefer cloning a curated entry from elsewhere in the toolbox — it keeps
    // the level's shadows and defaults.
    const cloneOrMakeBlock = (type: string) => {
      const existing = Array.from(
        doc.getElementsByTagNameNS('*', 'block')
      ).find(b => b.getAttribute('type') === type && b.closest('category'));
      return existing ? (existing.cloneNode(true) as Element) : makeBlock(type);
    };
    const presentIn = (category: Element) =>
      new Set(
        Array.from(category.getElementsByTagNameNS('*', 'block')).map(b =>
          b.getAttribute('type')
        )
      );

    // The composites lead the Sprites category (reversed so player is first).
    const spritesPresent = presentIn(sprites);
    [...PLATFORMER_COMPOSITES].reverse().forEach(([type]) => {
      if (!spritesPresent.has(type)) {
        sprites.insertBefore(makeBlock(type), sprites.firstChild);
      }
    });

    // The injected categories, in list order, at the top of the toolbox.
    const firstCategory = categories[0];
    INJECTED_CATEGORIES.forEach(({name, types}) => {
      let category = categories.find(c => c.getAttribute('name') === name);
      if (!category) {
        category = doc.createElementNS(sprites.namespaceURI, 'category');
        category.setAttribute('name', name);
        firstCategory.parentNode?.insertBefore(category, firstCategory);
      }
      const present = presentIn(category);
      types.forEach(type => {
        if (!present.has(type)) {
          category.appendChild(cloneOrMakeBlock(type));
        }
      });
    });

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return toolboxXml;
  }
}

/**
 * Compile a serialized workspace to JS headless (for scenes not open in the
 * Code tab). Returns '' for an empty/missing source.
 */
export function compileWorkspaceSource(
  source: WorkspaceSerialization | undefined
): string {
  if (!source) {
    return '';
  }
  const workspace = new BlocklyCore.Workspace();
  try {
    Blockly.serialization.workspaces.load(source, workspace);
    return Blockly.JavaScript.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

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

// The classic costumePicker/backgroundPicker input types, with lab2's empty
// state and Images-tab button. (The classic animation-mode buttons don't
// apply here — this lab has no AnimationTab.)
function animationPicker(kind: AnimationKind) {
  return {
    addInput(
      blockly: unknown,
      block: BlocklyCore.Block,
      inputConfig: {name: string; label: string},
      currentInputRow: BlocklyCore.Input
    ) {
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(
          new CdoFieldAnimationDropdown(
            () => animationOptions(kind),
            THUMBNAIL_SIZE[kind],
            THUMBNAIL_SIZE[kind],
            MAKE_IMAGE_BUTTONS
          ),
          inputConfig.name
        );
    },
    generateCode(block: BlocklyCore.Block, arg: {name: string}) {
      return block.getFieldValue(arg.name);
    },
  };
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

/**
 * Install the level's DB-backed block pool plus the lab's own additions;
 * returns category -> block type names. Mirrors dance's installSharedBlocks.
 */
export function installSharedBlocks(sharedBlocks: BlockDefinition[]): {
  [category: string]: string[];
} {
  return blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: [
      ...(sharedBlocks || []),
      ...SPRITELAB2_EXTRA_SHARED_BLOCKS,
    ],
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

// Predefined behaviors (runtime implementations in NativeSpriteLab or
// extraSharedBlocks). Levels typically list only a subset; we surface all.
const PREDEFINED_BEHAVIOR_BLOCKS = [
  'gamelab_draggable',
  'gamelab_avoidingTargets',
  'gamelab_followingTargets',
  'gamelab_tumbling',
  'gamelab_patrollingUpDown',
  // Lab-owned (see SPRITELAB2_EXTRA_SHARED_BLOCKS).
  'spritelab2_movingLeft',
  'spritelab2_movingWithArrowKeys',
  'spritelab2_patrollingLeftRight',
  'spritelab2_patrollingOnBlocks',
];

/**
 * Ensure the toolbox's "Behaviors" category lists all predefined behavior
 * blocks (that are registered), not just whatever the level's toolbox included.
 * Call after blocks are installed. No-op if there's no Behaviors category.
 */
export function ensurePredefinedBehaviors(toolboxXml: string): string {
  try {
    const doc = new DOMParser().parseFromString(toolboxXml, 'text/xml');
    const behaviors = Array.from(
      doc.getElementsByTagNameNS('*', 'category')
    ).find(c => c.getAttribute('name') === 'Behaviors');
    if (!behaviors) {
      return toolboxXml;
    }
    const present = new Set(
      Array.from(behaviors.getElementsByTagNameNS('*', 'block')).map(b =>
        b.getAttribute('type')
      )
    );
    PREDEFINED_BEHAVIOR_BLOCKS.forEach(type => {
      if (!present.has(type) && Blockly.Blocks[type]) {
        const block = doc.createElementNS(behaviors.namespaceURI, 'block');
        block.setAttribute('type', type);
        behaviors.appendChild(block);
      }
    });
    return new XMLSerializer().serializeToString(doc);
  } catch {
    return toolboxXml;
  }
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
