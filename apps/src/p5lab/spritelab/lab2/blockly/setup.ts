import * as BlocklyCore from 'blockly/core';

import * as blockUtils from '@cdo/apps/block_utils';
import {BlockDefinition, CustomInputTypes} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';
import {getStore} from '@cdo/apps/redux';

import {SCENES_UI_VARIANT} from '../experiments';

// blocksCommon is a plain CommonJS module (exports.install = ...); give it a
// minimal typed view.
const blocksCommon = blocksCommonModule as unknown as {
  install: (blockly: unknown, options: object) => void;
};

// Installs the Sprite Lab block definitions and their JS generators into the
// global Blockly once per page. This is the StudioApp-free equivalent of the
// install performed in appMain.js (blocksCommon.install + blocksModule.install).
// Sprite Lab's own install() also wires up the behavior FunctionEditor and
// custom procedure blocks, so we rely on it rather than re-registering blocks
// individually the way dance/blockly/setup.ts does.
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

// Scenes UI variant: the go-to-scene block. Registered client-side (not in the
// DB block pool) because its dropdown options are the project's scenes, which
// only this lab knows.
export const GO_TO_SCENE_BLOCK_TYPE = 'spritelab2_goToScene';

// Dropdown options for the go-to-scene block: [friendly name, scene id]. The
// scene id is the source of truth; the name is just the label. Reads the
// redux mirror so the menu stays current as scenes are added.
function sceneMenuOptions(): [string, string][] {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  if (scenes.length === 0) {
    return [['no scenes', '']];
  }
  return scenes.map((s: {id: string; name: string}) => [s.name, s.id]);
}

// Cross-project variant: jump into a scene from a section-mate's project.
export const GO_TO_EXTERNAL_SCENE_BLOCK_TYPE = 'spritelab2_goToExternalScene';

// Options for the go-to-external-scene block: [label, "<channel>:<sceneId>"].
// Populated from the section-scenes API into redux before blocks load, and
// refreshed each time the dropdown is opened (see ExternalSceneDropdown).
function externalSceneMenuOptions(): [string, string][] {
  const options = getStore().getState().spriteLab2?.externalScenes || [];
  if (options.length === 0) {
    return [['no scenes shared with you', '']];
  }
  return options.map((o: {key: string; label: string}) => [o.label, o.key]);
}

// The view registers a handler that re-fetches section scenes into redux, so
// the dropdown can show classmates' scenes added while the lab is open.
let externalSceneRefreshHandler: (() => Promise<void>) | null = null;
export function setExternalSceneRefreshHandler(
  handler: (() => Promise<void>) | null
): void {
  externalSceneRefreshHandler = handler;
}

// A dropdown whose options come from other students' live projects: refresh
// the list from the server on every open. The menu render is deferred briefly
// (capped, so a slow API degrades to the last-known list instead of blocking
// the click).
class ExternalSceneDropdown extends BlocklyCore.FieldDropdown {
  protected showEditor_(e?: MouseEvent) {
    const open = () => super.showEditor_(e);
    if (!externalSceneRefreshHandler) {
      open();
      return;
    }
    const timeout = new Promise<void>(resolve => setTimeout(resolve, 1200));
    Promise.race([externalSceneRefreshHandler().catch(() => {}), timeout])
      .then(open)
      .catch(open);
  }
}

function installSceneBlocks(): void {
  if (Blockly.Blocks[GO_TO_SCENE_BLOCK_TYPE]) {
    return;
  }
  Blockly.Blocks[GO_TO_SCENE_BLOCK_TYPE] = {
    init: function (this: BlocklyCore.Block) {
      this.appendDummyInput()
        .appendField('go to scene')
        .appendField(new BlocklyCore.FieldDropdown(sceneMenuOptions), 'SCENE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('default');
      this.setTooltip(
        'Stop this scene and start the chosen one. Its "when run" code runs ' +
          'after a quick fade from black.'
      );
    },
  };
  Blockly.getGenerator().forBlock[GO_TO_SCENE_BLOCK_TYPE] = block =>
    `goToScene(${JSON.stringify(block.getFieldValue('SCENE'))});\n`;

  Blockly.Blocks[GO_TO_EXTERNAL_SCENE_BLOCK_TYPE] = {
    init: function (this: BlocklyCore.Block) {
      this.appendDummyInput()
        .appendField('go to external scene')
        .appendField(
          new ExternalSceneDropdown(externalSceneMenuOptions),
          'SCENE'
        );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('default');
      this.setTooltip(
        'Jump into a scene from a classmate’s project (loads their scene ' +
          'and images, then fades in).'
      );
    },
  };
  Blockly.getGenerator().forBlock[GO_TO_EXTERNAL_SCENE_BLOCK_TYPE] = block =>
    `goToExternalScene(${JSON.stringify(block.getFieldValue('SCENE'))});\n`;
}

/**
 * Ensure the toolbox offers the go-to-scene block. It goes at the end of the
 * "Game Design" category when the level has one, since scene jumps are a game
 * mechanic. No-op when the variant is off or the category is absent.
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

/**
 * Compile a scene's serialized workspace to JS on a headless workspace. Used
 * for scenes that aren't open in the Code tab (the visible workspace compiles
 * itself). Returns '' for an empty/missing source.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compileWorkspaceSource(source: any): string {
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

// Lab-owned additions to the level's shared block pool, delivered the same
// way DB pool blocks are (block config + interpreted helperCode, which the
// engine prepends to user code). Keep block names as pool_func.
export const SPRITELAB2_EXTRA_SHARED_BLOCKS = [
  {
    name: 'spritelab2_movingLeft',
    pool: 'spritelab2',
    category: 'Behaviors',
    config: {
      func: 'movingLeft',
      blockText: 'moving left',
      returnType: 'Behavior',
      style: 'behavior_blocks',
    },
    helperCode: [
      'function movingLeft() {',
      '  return {',
      '    func: function (spriteId) {',
      '      moveInDirection(spriteId, 2, "West");',
      '    },',
      "    name: 'moving left',",
      '  };',
      '}',
    ].join('\n'),
  },
] as unknown as BlockDefinition[];

/**
 * Installs the level's shared/custom block definitions (the DB-backed Sprite Lab
 * block pool, e.g. GamelabJr) plus the lab's own additions, and returns a map
 * of category -> block type names for toolbox construction. Mirrors
 * dance/blockly/setup.ts installSharedBlocks.
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
    customInputTypes:
      spritelabBlocks.customInputTypes as unknown as CustomInputTypes,
  });
}

// Sprite Lab's predefined behaviors. Each has a runtime implementation in the
// NativeSpriteLab helper library and a registered "get behavior" block. A
// level's toolbox typically only lists a subset (often just draggable), so we
// surface the full set in the Behaviors category.
const PREDEFINED_BEHAVIOR_BLOCKS = [
  'gamelab_draggable',
  'gamelab_avoidingTargets',
  'gamelab_followingTargets',
  'gamelab_tumbling',
  'gamelab_patrollingUpDown',
  // Lab-owned (see SPRITELAB2_EXTRA_SHARED_BLOCKS).
  'spritelab2_movingLeft',
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
