//When a user right-clicks (or long presses) on a block or workspace, a context menu
// with additional actions is shown. We configure this context menu to show
// additional options or to remove some default options.

import * as BlocklyCore from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

import LegacyDialog from '../../code-studio/LegacyDialog';
import {MenuOptionStates, BLOCK_TYPES} from '../constants';
import {ExtendedBlockSvg} from '../types';

// Some options are only available to levelbuilders via start mode.
// Literal strings are used for display text instead of translatable strings
// as Levelbuilder can only be used in English.
const registerOverrideBlockId = function (weight: number) {
  const overrideIdOption = {
    displayText: () => 'Override block id',
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode || Blockly.isToolboxMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) return;

      const currentId = block.id;
      const currentOverride =
        Blockly.blockIdOverrides?.[currentId] ?? currentId;

      Blockly.dialog.prompt(
        'Enter a new block id (requires saving):',
        currentOverride,
        newId => {
          if (!Blockly.blockIdOverrides) {
            Blockly.blockIdOverrides = {};
          }
          if (newId) {
            Blockly.blockIdOverrides[currentId] = newId;
          }
        }
      );
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'overrideBlockId',
    weight,
  };
  safeRegisterOption(overrideIdOption);
};

const registerDeletable = function (weight: number) {
  const deletableOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      // isDeletable is a built in Blockly function that checks whether the block
      // is deletable, is not a shadow, and if the workspace is readonly.
      return scope.block?.isDeletable()
        ? 'Make Undeletable to Users'
        : 'Make Deletable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block.setDeletable(!scope.block.isDeletable());
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDeletable',
    weight,
  };
  safeRegisterOption(deletableOption);
};

const registerMovable = function (weight: number) {
  const movableOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      // isMovable is a built in Blockly function that checks whether the block
      // is movable or not.
      return scope.block?.isMovable()
        ? 'Make Immovable to Users'
        : 'Make Movable to Users';
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      if (Blockly.isToolboxMode) {
        // Only child blocks should be immovable.
        if (scope.block !== scope.block?.getRootBlock()) {
          return MenuOptionStates.ENABLED;
        } else {
          return MenuOptionStates.DISABLED;
        }
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block.setMovable(!scope.block.isMovable());
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockMovable',
    weight,
  };
  safeRegisterOption(movableOption);
};

const registerNextConnection = function (weight: number) {
  const nextConnectionOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) {
        return '';
      }
      const displayText = `${
        block.nextConnection ? 'Disable' : 'Enable'
      } Next Connection`;
      return displayText;
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const block = scope.block as ExtendedBlockSvg;

      // This option requires a custom mutator in order to serialize the disabled connection.
      if (Blockly.isStartMode && block?.canSerializeNextConnection) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) {
        return;
      }
      block.nextConnection?.disconnect();
      block.setNextStatement(!block.nextConnection);
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'nextConnection',
    weight,
  };
  safeRegisterOption(nextConnectionOption);
};

const registerEditable = function (weight: number) {
  const editableOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      // isEditable is a built in Blockly function that checks whether the block
      // is editable or not.
      return scope.block?.isEditable()
        ? 'Make Uneditable to Users'
        : 'Make Editable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode || Blockly.isToolboxMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block.setEditable(!scope.block.isEditable());
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockEditable',
    weight,
  };
  safeRegisterOption(editableOption);
};

const registerShadow = function (weight: number) {
  const shadowOption = {
    displayText: () => 'Make Shadow',
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (
        (Blockly.isStartMode || Blockly.isToolboxMode) &&
        scope.block &&
        canBeShadow(scope.block)
      ) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      scope.block?.setShadow(true);
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockToShadow',
    weight,
  };
  safeRegisterOption(shadowOption);
};

const registerUnshadow = function (weight: number) {
  const unshadowOption = {
    // If there's 1 child, text should be 'Make Child Block Non-Shadow'
    // If there's n children, text should be `Make ${n} Child Blocks Non-Shadow`
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (!scope.block) {
        return '';
      }
      const displayText = `Make ${
        shadowChildCount(scope.block) > 1
          ? `${shadowChildCount(scope.block)} `
          : ''
      }Child Block${shadowChildCount(scope.block) > 1 ? 's' : ''} Non-Shadow`;
      return displayText;
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (
        (Blockly.isStartMode || Blockly.isToolboxMode) &&
        scope.block &&
        hasShadowChildren(scope.block)
      ) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block
          .getChildren(/*ordered*/ false)
          .forEach(child => child.setShadow(false));
        clearShadowState(scope.block);
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'childUnshadow',
    weight,
  };
  safeRegisterOption(unshadowOption);
};

const registerToggleShadowStack = function (weight: number) {
  const toggleShadowStackOption = {
    displayText: (scope: BlocklyCore.ContextMenuRegistry.Scope) => {
      if (
        scope.block &&
        shadowChildCount(scope.block) === scope.block.getChildren(false).length
      ) {
        return 'Make All Blocks in Stack Non-Shadow';
      } else {
        return 'Make All Blocks in Stack Shadow';
      }
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (
        Blockly.isStartMode &&
        scope.block &&
        scope.block.isEnabled() &&
        scope.block === scope.block.getRootBlock()
      ) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const workspace = scope.block?.workspace;
      if (scope.block && workspace) {
        const shouldShadow =
          shadowChildCount(scope.block) !==
          scope.block.getChildren(false).length;
        workspace
          .getAllBlocks()
          .filter(
            block =>
              block !== scope.block && block.getRootBlock() === scope.block
          )
          .forEach(block => block.setShadow(shouldShadow));
        if (!shouldShadow) {
          clearShadowState(scope.block);
        }
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'stackToggleShadow',
    weight,
  };
  safeRegisterOption(toggleShadowStackOption);
};

const registerAllBlocksUndeletable = function (weight: number) {
  const workspaceBlocksUndeletableOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Undeletable';
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode) {
        if (
          scope.workspace?.getAllBlocks().every(block => !block.isDeletable())
        ) {
          return MenuOptionStates.DISABLED;
        }
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.workspace) {
        scope.workspace
          .getAllBlocks()
          .forEach(block => block.setDeletable(false));
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceBlocksUndeletable',
    weight,
  };
  safeRegisterOption(workspaceBlocksUndeletableOption);
};

const registerAllBlocksUneditable = function (weight: number) {
  const workspaceBlocksUneditableOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Uneditable';
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode || Blockly.isToolboxMode) {
        if (
          scope.workspace?.getAllBlocks().every(block => !block.isEditable())
        ) {
          return MenuOptionStates.DISABLED;
        }
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.workspace) {
        scope.workspace
          .getAllBlocks()
          // In toolbox mode, category blocks should remain editable.
          .filter(
            b =>
              !(
                [BLOCK_TYPES.category, BLOCK_TYPES.categoryDynamic] as string[]
              ).includes(b.type)
          )
          .forEach(block => block.setEditable(false));
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceBlocksUneditable',
    weight,
  };
  safeRegisterOption(workspaceBlocksUneditableOption);
};

const registerAllBlocksUnmovable = function (weight: number) {
  const workspaceBlocksUnmovableOption = {
    displayText: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Unmovable';
    },
    preconditionFn: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode) {
        if (
          scope.workspace?.getAllBlocks().every(block => !block.isMovable())
        ) {
          return MenuOptionStates.DISABLED;
        }
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: BlocklyCore.ContextMenuRegistry.Scope) {
      if (scope.workspace) {
        scope.workspace
          .getAllBlocks()
          .forEach(block => block.setMovable(false));
      }
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceBlocksUnMovable',
    weight,
  };
  safeRegisterOption(workspaceBlocksUnmovableOption);
};

/**
 * Option to open help for a block.
 */
function registerHelp(weight: number) {
  const helpOption = {
    displayText() {
      return commonI18n.getBlockDocs();
    },
    preconditionFn(scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!Blockly.showBlockHelp || !block) {
        return 'hidden';
      }
      const url =
        typeof block.helpUrl === 'function' ? block.helpUrl() : block.helpUrl;
      // Some common Blockly blocks have help URLs for pages on Wikipedia, GitHub, etc.
      // We only want to allow a documentation dialog for one of our local docs links.
      if (url && url.startsWith('/docs/')) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback(scope: BlocklyCore.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) {
        return;
      }
      const url =
        typeof block.helpUrl === 'function' ? block.helpUrl() : block.helpUrl;
      const dialog = new LegacyDialog({
        body: $('<iframe>')
          .addClass('markdown-instructions-container')
          .width('100%')
          .attr('src', url),
        autoResizeScrollableElement: '.markdown-instructions-container',
        id: 'block-documentation-lightbox',
        link: url,
      });
      dialog.show();
    },
    scopeType: BlocklyCore.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockHelp',
    weight,
  };
  safeRegisterOption(helpOption);
}

export enum WeightOptions {
  CUT = 0,
  COPY = 1,
  PASTE = 2,
  DELETE = 3,
  DUPLICATE = 4,
  DISABLE = 5,
  MOVE = 6,
  EDIT = 7,
  MOVE_COMMENT = 8,
  UNDO = 9,
  REDO = 10,
  COMMENT = 11,
  HELP = 12,
  CLEANUP = 13,
  LEVELBUILDER = 14,
}

export const registerAllContextMenuItems = function () {
  unregisterDefaultOptions();

  const menuWeightMap: Record<string, WeightOptions> = {
    blockCopyToStorage: WeightOptions.COPY,
    blockPasteFromStorage: WeightOptions.PASTE,
    blockDelete: WeightOptions.DELETE,
    blockDuplicate: WeightOptions.DUPLICATE,
    blockDisable: WeightOptions.DISABLE,
    undoWorkspace: WeightOptions.UNDO,
    redoWorkspace: WeightOptions.REDO,
    blockComment: WeightOptions.COMMENT,
    cleanWorkspace: WeightOptions.CLEANUP,
  };
  for (const [option, weight] of Object.entries(menuWeightMap)) {
    overrideOptionWeight(option, weight);
  }
  registerHelp(WeightOptions.HELP); // Custom student-facing help option.

  // Our levelbuilder options should all show below the registered default options.
  let nextWeight = WeightOptions.LEVELBUILDER;

  // Custom options for levelbuilder. We increment the weight for each so they are sorted
  // in the order listed here. The ++ incrementation happens after the value is accessed.
  registerDeletable(nextWeight++);
  registerMovable(nextWeight++);
  registerNextConnection(nextWeight++);
  registerEditable(nextWeight++);
  registerShadow(nextWeight++);
  registerUnshadow(nextWeight++);
  registerToggleShadowStack(nextWeight++);
  registerOverrideBlockId(nextWeight++);
  registerAllBlocksUndeletable(nextWeight++);
  registerAllBlocksUneditable(nextWeight++);
  registerAllBlocksUnmovable(nextWeight++);
};

function canBeShadow(block: BlocklyCore.Block) {
  return (
    block.getSurroundParent() &&
    !block.getVarModels().length &&
    !nonShadowChildCount(block)
  );
}

function shadowChildCount(block: BlocklyCore.Block) {
  return block.getChildren(/*ordered*/ false).filter(child => child.isShadow())
    .length;
}

function nonShadowChildCount(block: BlocklyCore.Block) {
  return block.getChildren(/*ordered*/ false).filter(child => !child.isShadow())
    .length;
}

function hasShadowChildren(block: BlocklyCore.Block) {
  return shadowChildCount(block) > 0;
}

/**
 * Resets the shadow state of a block's connections after converting
 * shadow blocks back to normal blocks. This is needed to ensure that
 * the parent doesn't continue to have shadow blocks below the converted
 * blocks.
 **/
function clearShadowState(block: BlocklyCore.Block) {
  const connections = block.getConnections_(true);
  connections?.forEach(connection => {
    connection.setShadowState(null);
  });
}

/**
 * Unregister some default options. We do this either because the options are needlessly
 * advanced for our target users or because the options have undesired impacts.
 */
function unregisterDefaultOptions() {
  // This needs to be wrapped in a try for now because our blocklyWrapperTest.js
  // is not correctly cleaning up its state.
  try {
    // Option to collapse or expand a block.
    BlocklyCore.ContextMenuRegistry.registry.unregister('blockCollapseExpand');
    // Option to open help for a block. Overrided to use our documentation.
    BlocklyCore.ContextMenuRegistry.registry.unregister('blockHelp');
    // Option to use inline inputs .
    BlocklyCore.ContextMenuRegistry.registry.unregister('blockInline');
    // Option to collapse all blocks on a workspace.
    BlocklyCore.ContextMenuRegistry.registry.unregister('collapseWorkspace');
    // Option to expand all blocks on a workspace.
    BlocklyCore.ContextMenuRegistry.registry.unregister('expandWorkspace');
    // Option to delete all blocks on a workspace.
    BlocklyCore.ContextMenuRegistry.registry.unregister('workspaceDelete');
  } catch (error) {}
}

/**
 * Unregisters the cross-tab copy/paste options.
 * These options are made redundant by the ones provided by @blockly/keyboard-navigation
 */
export function unregisterCrossTabPluginOptions() {
  try {
    BlocklyCore.ContextMenuRegistry.registry.unregister('blockCopyToStorage');
    BlocklyCore.ContextMenuRegistry.registry.unregister(
      'blockPasteFromStorage'
    );
  } catch (error) {}
}

export function overrideOptionWeight(optionId: string, newWeight: number) {
  const option = BlocklyCore.ContextMenuRegistry.registry.getItem(optionId);
  if (option) {
    option.weight = newWeight;
    BlocklyCore.ContextMenuRegistry.registry.unregister(optionId);
    BlocklyCore.ContextMenuRegistry.registry.register(option);
  }
}

// Registers a context menu option, first unregistering any existing option with the same id.
// This prevents "already registered" errors, especially in tests.
function safeRegisterOption(
  option: BlocklyCore.ContextMenuRegistry.RegistryItem
) {
  if (BlocklyCore.ContextMenuRegistry.registry.getItem(option.id)) {
    BlocklyCore.ContextMenuRegistry.registry.unregister(option.id);
  }
  BlocklyCore.ContextMenuRegistry.registry.register(option);
}
