import * as BlocklyCore from 'blockly/core';

import * as blockUtils from '@cdo/apps/block_utils';
import {
  BlockDefinition,
  CustomInputTypes,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';

import {FIELD_SYSTEM_DROPDOWN_TYPE, SystemDropdown} from './behavior2Fields';
import labBlockDefinitions from './blockDefinitions';
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
  Blockly.fieldRegistry.register(FIELD_SYSTEM_DROPDOWN_TYPE, SystemDropdown);
  for (const {definition, generator} of labBlockDefinitions) {
    Blockly.Blocks[definition.type] = {
      init: function (this: BlocklyCore.Block) {
        this.jsonInit(definition);
      },
    };
    Blockly.getGenerator().forBlock[definition.type] = generator;
  }
  // The behavior2 system blocks compile to these identifiers (bound by
  // compileBehavior2Sources' wrapper and startSystem's helper); keep the
  // variable name mapper from handing them to a student variable.
  Blockly.getGenerator().addReservedWords(
    '__behavior2s,__group,__option,__current,' +
      'startBehavior2,forEachSpriteOfType'
  );
}

/**
 * Append the scene blocks to the "Game Design" category. No-op when the
 * category is absent.
 */
export function ensureSceneBlocks(toolboxXml: string): string {
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

// Grid-placement blocks that aren't composites still want a marked-cell
// default in the toolbox.
const GRID_FIELD_DEFAULTS = new Map<string, string>([
  ...PLATFORMER_COMPOSITES,
  [
    'spritelab2_makeSpriteAtGrid',
    platformerGrid((row, col) => (row === 4 && col === 5 ? 1 : 0)),
  ],
  [
    'spritelab2_makeTypedSprites',
    platformerGrid(row => (row === PLATFORMER_GRID_SIZE - 1 ? 1 : 0)),
  ],
  [
    'spritelab2_makeSpritesWithSystem',
    platformerGrid((row, col) => (row === 4 && col === 3 ? 1 : 0)),
  ],
]);

// Lab-injected toolbox categories, inserted at the top of every level's
// toolbox. The levelbuilder owns whatever they author: a category with this
// name is used as written, an EMPTY one suppresses the category, and the
// default lineup appears only when the level doesn't mention the name.
const INJECTED_CATEGORIES: {name: string; types: string[]}[] = [
  {
    // Behavior2 prototype: typed sprites plus the start-system block. The
    // implementations these start live on the Systems tab.
    name: 'Platform2',
    types: [
      'gamelab_setBackgroundImageAs',
      'spritelab2_makeTypedSprites',
      'spritelab2_makeSpritesWithSystem',
      'spritelab2_startSystem',
      'spritelab2_setSystem',
      'spritelab2_whenSystemReports',
      'spritelab2_reportedSprite',
    ],
  },
  {
    // The platformer composites plus the core event blocks.
    name: 'Platform',
    types: [
      'gamelab_setBackgroundImageAs',
      'spritelab2_makePlatformBlocks',
      'spritelab2_makePlatformPlayer',
      'spritelab2_makeSpriteAtGrid',
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
      'gamelab_atTime',
      GO_TO_SCENE_BLOCK_TYPE,
      GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
      'gamelab_addBehaviorSimple',
      'spritelab2_movingLeft',
      'spritelab2_patrollingLeftRight',
    ],
  },
];

/**
 * Lead the "Sprites" category with the platformer composites and build the
 * injected categories at the top of the toolbox (lab-owned blocks, so
 * DB-authored toolboxes don't know them). See INJECTED_CATEGORIES for how a
 * level opts out.
 */
export function ensureInjectedCategories(toolboxXml: string): string {
  try {
    const doc = new DOMParser().parseFromString(toolboxXml, 'text/xml');
    const categories = Array.from(doc.getElementsByTagNameNS('*', 'category'));
    const sprites = categories.find(c => c.getAttribute('name') === 'Sprites');
    if (!sprites) {
      return toolboxXml;
    }
    // A new block element: grid-placement blocks carry their GRID defaults,
    // anything else starts bare (fields initialize to their own defaults).
    const makeBlock = (type: string) => {
      const block = doc.createElementNS(sprites.namespaceURI, 'block');
      block.setAttribute('type', type);
      const grid = GRID_FIELD_DEFAULTS.get(type);
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

    // The injected categories, in list order, at the top of the toolbox. A
    // category the level authors itself is used as written; an empty authored
    // one suppresses the category (see INJECTED_CATEGORIES).
    const firstCategory = categories[0];
    INJECTED_CATEGORIES.forEach(({name, types}) => {
      const authored = categories.find(c => c.getAttribute('name') === name);
      if (authored) {
        if (presentIn(authored).size === 0) {
          authored.remove();
        }
        return;
      }
      const category = doc.createElementNS(sprites.namespaceURI, 'category');
      category.setAttribute('name', name);
      firstCategory.parentNode?.insertBefore(category, firstCategory);
      types.forEach(type => category.appendChild(cloneOrMakeBlock(type)));
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

/**
 * Install the level's DB-backed block pool; returns category -> block type
 * names. Mirrors dance's installSharedBlocks. (Lab-owned blocks install via
 * installLabBlocks, not here.)
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

// Predefined behaviors (runtime implementations in NativeSpriteLab or
// blockDefinitions). Levels typically list only a subset; we surface all.
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
