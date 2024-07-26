//When a user right-clicks (or long presses) on a block or workspace, a context menu
// with additional actions is shown. We configure this context menu to show
// additional options or to remove some default options.

import GoogleBlockly, {
  Block,
  ContextMenuRegistry,
  Theme,
  WorkspaceSvg,
} from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';

import LegacyDialog from '../../code-studio/LegacyDialog';
import {
  Themes,
  MenuOptionStates,
  BLOCKLY_CURSOR,
  BLOCKLY_THEME,
  NAVIGATION_CURSOR_TYPES,
  DARK_THEME_SUFFIX,
} from '../constants';
import {getBaseName} from '../utils';

// Some options are only available to levelbuilders via start mode.
// Literal strings are used for display text instead of translatable strings
// as Levelbuilder can only be used in English.
const registerDeletable = function (weight: number) {
  const deletableOption = {
    displayText: function (scope: ContextMenuRegistry.Scope) {
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
    callback: function (scope: ContextMenuRegistry.Scope) {
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
    displayText: function (scope: ContextMenuRegistry.Scope) {
      // isMovable is a built in Blockly function that checks whether the block
      // is movable or not.
      return scope.block?.isMovable()
        ? 'Make Immovable to Users'
        : 'Make Movable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
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

const registerEditable = function (weight: number) {
  const editableOption = {
    displayText: function (scope: ContextMenuRegistry.Scope) {
      // isEditable is a built in Blockly function that checks whether the block
      // is editable or not.
      return scope.block?.isEditable()
        ? 'Make Uneditable to Users'
        : 'Make Editable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
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
    preconditionFn: function (scope: ContextMenuRegistry.Scope) {
      if (Blockly.isStartMode && scope.block && canBeShadow(scope.block)) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
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
    displayText: function (scope: ContextMenuRegistry.Scope) {
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
    preconditionFn: function (scope: ContextMenuRegistry.Scope) {
      if (
        Blockly.isStartMode &&
        scope.block &&
        hasShadowChildren(scope.block)
      ) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
      scope.block
        ?.getChildren(/*ordered*/ false)
        .forEach(child => child.setShadow(false));
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'childUnshadow',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(unshadowOption);
};

const registerAllBlocksUndeletable = function (weight: number) {
  const workspaceBlocksUndeletableOption = {
    displayText: function (scope: ContextMenuRegistry.Scope) {
      return 'Make ALL Blocks Undeletable';
    },
    preconditionFn: function (scope: ContextMenuRegistry.Scope) {
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
    callback: function (scope: ContextMenuRegistry.Scope) {
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

const registerKeyboardNavigation = function (weight: number) {
  const keyboardNavigationOption = {
    displayText: function (scope: ContextMenuRegistry.Scope) {
      return scope.workspace?.keyboardAccessibilityMode
        ? commonI18n.blocklyKBNavOff()
        : commonI18n.blocklyKBNavOn();
    },
    preconditionFn: function () {
      return Blockly.navigationController
        ? MenuOptionStates.ENABLED
        : MenuOptionStates.HIDDEN;
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
      const controller = Blockly.navigationController;
      if (scope.workspace?.keyboardAccessibilityMode) {
        controller.disable(scope.workspace);
      } else {
        controller.enable(scope.workspace);
        Blockly.navigationController.navigation.focusWorkspace(scope.workspace);
      }
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'keyboardNavigation',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(keyboardNavigationOption);
};

/**
 * Change cursor type for keyboard navigation
 */
const registerCursor = function (cursorType: string, weight: number) {
  const cursorOption = {
    displayText: function () {
      return isCurrentCursor(cursorType)
        ? `✓ ${commonI18n.usingCursorType({type: cursorType})}`
        : `${commonI18n.useCursorType({type: cursorType})}`;
    },
    preconditionFn: function (scope: ContextMenuRegistry.Scope) {
      if (
        !experiments.isEnabled(experiments.KEYBOARD_NAVIGATION) ||
        !scope.workspace?.keyboardAccessibilityMode
      ) {
        return MenuOptionStates.HIDDEN;
      } else if (isCurrentCursor(cursorType)) {
        return MenuOptionStates.DISABLED;
      } else {
        return MenuOptionStates.ENABLED;
      }
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
      setNewCursor(cursorType, scope);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: `${cursorType}CursorOption`,
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(cursorOption);
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
    displayText: function (scope: ContextMenuRegistry.Scope) {
      return (
        (isCurrentTheme(name, scope.workspace)
          ? '✓ '
          : `${commonI18n.enable()} `) + label
      );
    },
    preconditionFn: function (scope: ContextMenuRegistry.Scope) {
      if (isCurrentTheme(name, scope.workspace)) {
        return MenuOptionStates.DISABLED;
      } else {
        return MenuOptionStates.ENABLED;
      }
    },
    callback: function (scope: ContextMenuRegistry.Scope) {
      localStorage.setItem(BLOCKLY_THEME, name);
      const currentTheme = scope.workspace?.getTheme();
      const themeName =
        name + (isDarkTheme(currentTheme) ? DARK_THEME_SUFFIX : '');
      setAllWorkspacesTheme(Blockly.themes[themeName as Themes], currentTheme);
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
    preconditionFn(scope: ContextMenuRegistry.Scope) {
      const block = scope.block;
      // This option is limited to an experiment until SL documentation is updated.
      if (!experiments.isEnabled(experiments.SPRITE_LAB_DOCS) || !block) {
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
    callback(scope: ContextMenuRegistry.Scope) {
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

function registerAllCursors(weight: number, cursorTypes: string[]) {
  cursorTypes.forEach((cursorType, index) => {
    registerCursor(cursorType, weight);
  });
}

function isCurrentCursor(cursorType: string) {
  const currentCursorType = Blockly.navigationController.cursorType;
  return cursorType === currentCursorType;
}

function setNewCursor(type: string, scope: ContextMenuRegistry.Scope) {
  localStorage.setItem(BLOCKLY_CURSOR, type);
  Blockly.navigationController.cursorType = type;
  Blockly.getMainWorkspace()
    .getMarkerManager()
    .setCursor(Blockly.getNewCursor(type));
  if (Blockly.getFunctionEditorWorkspace()) {
    Blockly.getFunctionEditorWorkspace()
      ?.getMarkerManager()
      .setCursor(Blockly.getNewCursor(type));
  }
  // Set the navigation state to the workspace and moves the cursor to the top block.
  Blockly.navigationController.navigation.focusWorkspace(scope.workspace);
}

export const registerAllContextMenuItems = function () {
  unregisterDefaultOptions();
  registerCustomBlockOptions();
  registerCustomWorkspaceOptions();
};

function canBeShadow(block: Block) {
  return (
    block.getSurroundParent() &&
    !block.getVarModels().length &&
    !nonShadowChildCount(block)
  );
}

function shadowChildCount(block: Block) {
  return block.getChildren(/*ordered*/ false).filter(child => child.isShadow())
    .length;
}

function nonShadowChildCount(block: Block) {
  return block.getChildren(/*ordered*/ false).filter(child => !child.isShadow())
    .length;
}

function hasShadowChildren(block: Block) {
  return shadowChildCount(block) > 0;
}

function isCurrentTheme(theme: Themes, workspace: WorkspaceSvg | undefined) {
  return (
    getBaseName(workspace?.getTheme().name as Themes) === getBaseName(theme)
  );
}

function isDarkTheme(theme: Theme | undefined) {
  return theme?.name.includes(DARK_THEME_SUFFIX);
}

function setAllWorkspacesTheme(
  newTheme: Theme,
  previousTheme: Theme | undefined
) {
  Blockly.Workspace.getAll().forEach(baseWorkspace => {
    // Headless workspaces do not have the ability to set the theme.
    const workspace = baseWorkspace as WorkspaceSvg;
    if (typeof workspace.setTheme === 'function') {
      workspace.setTheme(newTheme);
      // Re-render blocks if the font size changed.
      // Once https://github.com/google/blockly/issues/7782 is resolved,
      // we should be able to remove this.
      if (newTheme.fontStyle?.size !== previousTheme?.fontStyle?.size) {
        workspace.getAllBlocks().map(block => {
          block.markDirty();
          block.render();
        });
      }
    }
  });
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
    // Option to clean up blocks. cleanUp() doesn't currently account for immovable blocks.
    GoogleBlockly.ContextMenuRegistry.registry.unregister('cleanWorkspace');
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
  registerHelp(nextWeight++);
  registerDeletable(nextWeight++);
  registerMovable(nextWeight++);
  registerEditable(nextWeight++);
  registerShadow(nextWeight++);
  registerUnshadow(nextWeight++);
}

function registerCustomWorkspaceOptions() {
  // Each option has a "weight": a number that determines the sort order of the option.
  // Options with higher weights appear later in the context menu.

  // Expected registered workspace options (from Core and plugins):
  // 0: blockPasteFromStorage
  // 1: undoWorkspace
  // 2: redoWorkspace

  // Our custom options should show below the registered default options.
  let nextWeight = 3;

  // Custom workspace options. We increment the weight for each so they are automatically
  // sorted in the order listed here. The ++ incrementation happens after the value is accessed.
  registerKeyboardNavigation(nextWeight++);
  registerAllCursors(nextWeight++, NAVIGATION_CURSOR_TYPES);
  registerThemes(nextWeight++, themes);
  registerAllBlocksUndeletable(nextWeight++);
}
