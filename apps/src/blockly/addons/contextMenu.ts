//When a user right-clicks (or long presses) on a block or workspace, a context menu
// with additional actions is shown. We configure this context menu to show
// additional options or to remove some default options.

import * as GoogleBlockly from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

import LegacyDialog from '../../code-studio/LegacyDialog';
import {Themes, MenuOptionStates, BLOCK_TYPES} from '../constants';
import {ExtendedBlockSvg} from '../types';
import {getBaseName, setWorkspaceTheme} from '../utils';

// Some options are only available to levelbuilders via start mode.
// Literal strings are used for display text instead of translatable strings
// as Levelbuilder can only be used in English.
const registerOverrideBlockId = function (weight: number) {
  const overrideIdOption = {
    displayText: () => 'Override block id',
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode || Blockly.isToolboxMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'overrideBlockId',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(overrideIdOption);
};

const registerDeletable = function (weight: number) {
  const deletableOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block.setDeletable(!scope.block.isDeletable());
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDeletable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(deletableOption);
};

const registerMovable = function (weight: number) {
  const movableOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      // isMovable is a built in Blockly function that checks whether the block
      // is movable or not.
      return scope.block?.isMovable()
        ? 'Make Immovable to Users'
        : 'Make Movable to Users';
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block.setMovable(!scope.block.isMovable());
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockMovable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(movableOption);
};

const registerNextConnection = function (weight: number) {
  const nextConnectionOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) {
        return '';
      }
      const displayText = `${
        block.nextConnection ? 'Disable' : 'Enable'
      } Next Connection`;
      return displayText;
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      const block = scope.block as ExtendedBlockSvg;

      // This option requires a custom mutator in order to serialize the disabled connection.
      if (Blockly.isStartMode && block?.canSerializeNextConnection) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) {
        return;
      }
      block.nextConnection?.disconnect();
      block.setNextStatement(!block.nextConnection);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'nextConnection',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(nextConnectionOption);
};

const registerEditable = function (weight: number) {
  const editableOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block.setEditable(!scope.block.isEditable());
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockEditable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(editableOption);
};

const registerShadow = function (weight: number) {
  const shadowOption = {
    displayText: () => 'Make Shadow',
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      scope.block?.setShadow(true);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockToShadow',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(shadowOption);
};

const registerUnshadow = function (weight: number) {
  const unshadowOption = {
    // If there's 1 child, text should be 'Make Child Block Non-Shadow'
    // If there's n children, text should be `Make ${n} Child Blocks Non-Shadow`
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (scope.block) {
        scope.block
          .getChildren(/*ordered*/ false)
          .forEach(child => child.setShadow(false));
        clearShadowState(scope.block);
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'childUnshadow',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(unshadowOption);
};

const registerToggleShadowStack = function (weight: number) {
  const toggleShadowStackOption = {
    displayText: (scope: GoogleBlockly.ContextMenuRegistry.Scope) => {
      if (
        scope.block &&
        shadowChildCount(scope.block) === scope.block.getChildren(false).length
      ) {
        return 'Make All Blocks in Stack Non-Shadow';
      } else {
        return 'Make All Blocks in Stack Shadow';
      }
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'stackToggleShadow',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(toggleShadowStackOption);
};

const registerAllBlocksUndeletable = function (weight: number) {
  const workspaceBlocksUndeletableOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Undeletable';
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (scope.workspace) {
        scope.workspace
          .getAllBlocks()
          .forEach(block => block.setDeletable(false));
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceBlocksUndeletable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(
    workspaceBlocksUndeletableOption
  );
};

const registerAllBlocksUneditable = function (weight: number) {
  const workspaceBlocksUneditableOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Uneditable';
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceBlocksUneditable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(
    workspaceBlocksUneditableOption
  );
};

const registerAllBlocksUnmovable = function (weight: number) {
  const workspaceBlocksUnmovableOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Unmovable';
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (scope.workspace) {
        scope.workspace
          .getAllBlocks()
          .forEach(block => block.setMovable(false));
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceBlocksUnMovable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(
    workspaceBlocksUnmovableOption
  );
};

const themes = [
  {
    name: Themes.MODERN,
    label: commonI18n.blocklyModernTheme(),
  },
  {
    name: Themes.HIGH_CONTRAST,
    label: commonI18n.blocklyHighContrastTheme(),
  },
  {
    name: Themes.PROTANOPIA,
    label: commonI18n.blocklyProtanopiaTheme(),
  },
  {
    name: Themes.DEUTERANOPIA,
    label: commonI18n.blocklyDeuteranopiaTheme(),
  },
  {
    name: Themes.TRITANOPIA,
    label: commonI18n.blocklyTritanopiaTheme(),
  },
];
/**
 * Change workspace theme to specified theme
 */
const registerTheme = function (name: Themes, label: string, weight: number) {
  const themeOption = {
    displayText: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      return (
        (isCurrentTheme(name, scope.workspace)
          ? '✓ '
          : `${commonI18n.enable()} `) + label
      );
    },
    preconditionFn: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (Blockly.isJigsaw) {
        // Jigsaw uses its own custom theme with an extra large font size.
        // Blocks use hard-coded colors instead of styles, so switching
        // palettes is not possible.
        return MenuOptionStates.HIDDEN;
      }
      if (isCurrentTheme(name, scope.workspace)) {
        return MenuOptionStates.DISABLED;
      } else {
        return MenuOptionStates.ENABLED;
      }
    },
    callback: function (scope: GoogleBlockly.ContextMenuRegistry.Scope) {
      if (!scope.workspace) {
        return;
      }
      setWorkspaceTheme(scope.workspace, name);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: name + 'ThemeOption',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(themeOption);
};

function registerThemes(
  weight: number,
  themes: {name: Themes; label: string}[]
) {
  themes.forEach(theme => {
    registerTheme(theme.name, theme.label, weight);
  });
}

/**
 * Option to open help for a block.
 */
function registerHelp(weight: number) {
  const helpOption = {
    displayText() {
      return commonI18n.getBlockDocs();
    },
    preconditionFn(scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    callback(scope: GoogleBlockly.ContextMenuRegistry.Scope) {
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
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockHelp',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(helpOption);
}

export const registerAllContextMenuItems = function () {
  unregisterDefaultOptions();
  registerCustomBlockOptions();
  registerCustomWorkspaceOptions();
};

function canBeShadow(block: GoogleBlockly.Block) {
  return (
    block.getSurroundParent() &&
    !block.getVarModels().length &&
    !nonShadowChildCount(block)
  );
}

function shadowChildCount(block: GoogleBlockly.Block) {
  return block.getChildren(/*ordered*/ false).filter(child => child.isShadow())
    .length;
}

function nonShadowChildCount(block: GoogleBlockly.Block) {
  return block.getChildren(/*ordered*/ false).filter(child => !child.isShadow())
    .length;
}

function hasShadowChildren(block: GoogleBlockly.Block) {
  return shadowChildCount(block) > 0;
}

/**
 * Resets the shadow state of a block's connections after converting
 * shadow blocks back to normal blocks. This is needed to ensure that
 * the parent doesn't continue to have shadow blocks below the converted
 * blocks.
 **/
function clearShadowState(block: GoogleBlockly.Block) {
  const connections = block.getConnections_(true);
  connections?.forEach(connection => {
    connection.setShadowState(null);
  });
}

function isCurrentTheme(
  theme: Themes,
  workspace: GoogleBlockly.WorkspaceSvg | undefined
) {
  return (
    getBaseName(workspace?.getTheme().name as Themes) === getBaseName(theme)
  );
}

/**
 * Unregister some default options. We do this either because the options are needlessly
 * advanced for our target users or because the options have undesired impacts.
 */
function unregisterDefaultOptions() {
  // This needs to be wrapped in a try for now because our GoogleBlocklyWrapperTest.js
  // is not correctly cleaning up its state.
  try {
    // Option to collapse or expand a block.
    GoogleBlockly.ContextMenuRegistry.registry.unregister(
      'blockCollapseExpand'
    );
    // Option to open help for a block. Overrided to use our documentation.
    GoogleBlockly.ContextMenuRegistry.registry.unregister('blockHelp');
    // Option to use inline inputs .
    GoogleBlockly.ContextMenuRegistry.registry.unregister('blockInline');
    // Option to collapse all blocks on a workspace.
    GoogleBlockly.ContextMenuRegistry.registry.unregister('collapseWorkspace');
    // Option to expand all blocks on a workspace.
    GoogleBlockly.ContextMenuRegistry.registry.unregister('expandWorkspace');
    // Option to delete all blocks on a workspace.
    GoogleBlockly.ContextMenuRegistry.registry.unregister('workspaceDelete');
  } catch (error) {}
}

function registerCustomBlockOptions() {
  // Each option has a "weight": a number that determines the sort order of the option.
  // Options with higher weights appear later in the context menu.

  // Expected registered block options (from Core and plugins):
  // 0: blockCopyToStorage
  // 2: blockComment
  // 5: blockDisable
  // 6: blockDelete

  // Our custom options should show below the registered default options.
  let nextWeight = 7;

  // Custom block options. We increment the weight for each so they are automatically
  // sorted in the order listed here. The ++ incrementation happens after the value is accessed.
  registerOverrideBlockId(nextWeight++);
  registerHelp(nextWeight++);
  registerDeletable(nextWeight++);
  registerMovable(nextWeight++);
  registerNextConnection(nextWeight++);
  registerEditable(nextWeight++);
  registerShadow(nextWeight++);
  registerUnshadow(nextWeight++);
  registerToggleShadowStack(nextWeight++);
}

function registerCustomWorkspaceOptions() {
  // Each option has a "weight": a number that determines the sort order of the option.
  // Options with higher weights appear later in the context menu.

  // Expected registered workspace options (from Core and plugins):
  // 0: blockPasteFromStorage
  // 1: undoWorkspace
  // 2: redoWorkspace
  // 3: cleanWorkspace

  // Our custom options should show below the registered default options.
  let nextWeight = 3;

  // Custom workspace options. We increment the weight for each so they are automatically
  // sorted in the order listed here. The ++ incrementation happens after the value is accessed.
  registerThemes(nextWeight++, themes);
  registerAllBlocksUndeletable(nextWeight++);
  registerAllBlocksUneditable(nextWeight++);
  registerAllBlocksUnmovable(nextWeight++);
}
