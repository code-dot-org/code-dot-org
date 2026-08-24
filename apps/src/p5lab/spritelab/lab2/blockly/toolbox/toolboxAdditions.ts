// Lab-owned additions layered onto a level's authored toolbox at load time.
// A stopgap while every level wants the same lineup; this file should go
// away once levelbuilders author fine-grained toolboxes themselves.

import {cloneDeep} from 'lodash';

import {
  isBlockInfo,
  isStaticCategoryInfo,
  makeCategory,
} from '@cdo/apps/blockly/utils/toolbox';

import {DEFAULT_SCENE_GRID_SIZE} from '../../world';
import {GO_TO_EXTERNAL_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToExternalScene';
import {GO_TO_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToScene';
import {RESTART_SCENE_BLOCK_TYPE} from '../blockDefinitions/restartScene';
import {THE_PLAYER_BLOCK_TYPE} from '../blockDefinitions/thePlayer';

import {
  BlockInfo,
  findCategory,
  StaticCategoryInfo,
  ToolboxInfo,
} from './types';

// Sensible toolbox defaults for the platformer composites: the player marked
// mid-air above a full bottom-row floor. Same size as the grid fields, so a
// dragged-out block shows the playfield's own lattice.
const PLATFORMER_GRID_SIZE = DEFAULT_SCENE_GRID_SIZE;
function platformerGrid(mark: (row: number, col: number) => 0 | 1): string {
  return JSON.stringify(
    Array.from({length: PLATFORMER_GRID_SIZE}, (_, row) =>
      Array.from({length: PLATFORMER_GRID_SIZE}, (_, col) => mark(row, col))
    )
  );
}

// [block type, default GRID field] for the two composites, player first.
// Marks are placed relative to the grid's size so they keep their meaning at
// any playfield size: the player three rows above the floor, the floor along
// the bottom.
const PLATFORMER_COMPOSITES: [string, string][] = [
  [
    'spritelab2_makePlatformPlayer',
    platformerGrid((row, col) =>
      row === PLATFORMER_GRID_SIZE - 4 && col === 3 ? 1 : 0
    ),
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
    platformerGrid((row, col) =>
      row === PLATFORMER_GRID_SIZE - 4 && col === PLATFORMER_GRID_SIZE - 3
        ? 1
        : 0
    ),
  ],
]);

// Lab-injected toolbox categories, inserted at the top of every level's
// toolbox. The levelbuilder owns whatever they author: a category with this
// name is used as written, an EMPTY one suppresses the category, and the
// default lineup appears only when the level doesn't mention the name.
const INJECTED_CATEGORIES: {name: string; types: string[]}[] = [
  {
    // The platformer composites plus the core event blocks.
    name: 'Platform',
    types: [
      'gamelab_setBackgroundImageAs',
      'spritelab2_makePlatformBlocks',
      'spritelab2_makePlatformPlayer',
      'spritelab2_setAsPlatformPlayer',
      THE_PLAYER_BLOCK_TYPE,
      'spritelab2_setPlatformGravity',
      'spritelab2_setCameraZoom',
      RESTART_SCENE_BLOCK_TYPE,
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

// Predefined behaviors (runtime implementations in NativeSpriteLab or
// blockDefinitions). Levels typically list only a subset; we surface all.
const PREDEFINED_BEHAVIOR_BLOCKS = [
  'gamelab_draggable',
  'gamelab_avoidingTargets',
  'gamelab_followingTargets',
  'gamelab_tumbling',
  'gamelab_patrollingUpDown',
  // Lab-owned (see blockDefinitions).
  'spritelab2_movingLeft',
  'spritelab2_movingWithArrowKeys',
  'spritelab2_patrollingLeftRight',
  'spritelab2_patrollingOnBlocks',
];

// Block types present in a category (labels, buttons, etc. don't count).
function presentIn(category: StaticCategoryInfo): Set<string | undefined> {
  return new Set(category.contents.filter(isBlockInfo).map(b => b.type));
}

// Fill an EMPTY authored "Behaviors" category with the predefined behavior
// blocks. A level that lists its own behaviors is used as written, the same
// contract the injected categories follow — a level teaching one behavior
// must not have the whole set appear beside it.
function ensurePredefinedBehaviors(def: ToolboxInfo): void {
  const behaviors = findCategory(def.contents, 'Behaviors');
  if (!behaviors || presentIn(behaviors).size > 0) {
    return;
  }
  PREDEFINED_BEHAVIOR_BLOCKS.forEach(type => {
    if (Blockly.Blocks[type]) {
      behaviors.contents.push({kind: 'block', type});
    }
  });
}

// Append the scene blocks to the "Game Design" category.
function ensureSceneBlocks(def: ToolboxInfo): void {
  const category = findCategory(def.contents, 'Game Design');
  if (!category) {
    return;
  }
  const present = presentIn(category);
  [GO_TO_SCENE_BLOCK_TYPE, GO_TO_EXTERNAL_SCENE_BLOCK_TYPE].forEach(type => {
    if (!present.has(type)) {
      category.contents.push({kind: 'block', type});
    }
  });
}

// Lead the "Sprites" category with the platformer composites and build the
// injected categories at the top of the toolbox. See INJECTED_CATEGORIES for
// how a level opts out.
function ensureInjectedCategories(def: ToolboxInfo): void {
  const contents = def.contents;
  const categories = contents.filter(isStaticCategoryInfo);
  const sprites = findCategory(contents, 'Sprites');
  if (!sprites) {
    return;
  }
  // A new block entry: grid-placement blocks carry their GRID defaults,
  // anything else starts bare (fields initialize to their own defaults).
  const makeBlock = (type: string): BlockInfo => {
    const grid = GRID_FIELD_DEFAULTS.get(type);
    return {kind: 'block', type, ...(grid ? {fields: {GRID: grid}} : {})};
  };
  // Prefer cloning a curated entry from elsewhere in the toolbox — it keeps
  // the level's shadows and defaults.
  const cloneOrMakeBlock = (type: string): BlockInfo => {
    for (const category of categories) {
      const existing = category.contents
        .filter(isBlockInfo)
        .find(b => b.type === type);
      if (existing) {
        return cloneDeep(existing);
      }
    }
    return makeBlock(type);
  };

  // The composites lead the Sprites category (reversed so player is first).
  const spritesPresent = presentIn(sprites);
  [...PLATFORMER_COMPOSITES].reverse().forEach(([type]) => {
    if (!spritesPresent.has(type)) {
      sprites.contents.unshift(makeBlock(type));
    }
  });

  // The injected categories, in list order, at the top of the toolbox. A
  // category the level authors itself is used as written; an empty authored
  // one suppresses the category (see INJECTED_CATEGORIES).
  const injected: StaticCategoryInfo[] = [];
  INJECTED_CATEGORIES.forEach(({name, types}) => {
    const authored = findCategory(contents, name);
    if (authored) {
      if (presentIn(authored).size === 0) {
        contents.splice(contents.indexOf(authored), 1);
      }
      return;
    }
    injected.push(makeCategory(name, types.map(cloneOrMakeBlock)));
  });
  const firstCategory = contents.findIndex(e => e.kind === 'category');
  contents.splice(Math.max(firstCategory, 0), 0, ...injected);
}

/**
 * Layer the lab additions onto the authored toolbox: the predefined
 * behaviors, the scene blocks, and the injected categories. Pure. Call
 * after blocks are installed.
 */
export function applyToolboxAdditions(def: ToolboxInfo): ToolboxInfo {
  const out = cloneDeep(def);
  ensurePredefinedBehaviors(out);
  ensureSceneBlocks(out);
  ensureInjectedCategories(out);
  return out;
}
