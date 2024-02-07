import GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';
import {
  Themes,
  MenuOptionStates,
  BLOCKLY_CURSOR,
  BLOCKLY_THEME,
} from '../constants.js';
import LegacyDialog from '../../code-studio/LegacyDialog';
import experiments from '@cdo/apps/util/experiments';

const dark = 'dark';

// Some options are only available to levelbuilders via start mode.
// Literal strings are used for display text instead of translatable strings
// as Levelbuilder can only be used in English.
const registerDeletable = function (weight) {
  const deletableOption = {
    displayText: function (scope) {
      // isDeletable is a built in Blockly function that checks whether the block
      // is deletable, is not a shadow, and if the workspace is readonly.
      return scope.block.isDeletable()
        ? 'Make Undeletable to Users'
        : 'Make Deletable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope) {
      scope.block.setDeletable(!scope.block.isDeletable());
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDeletable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(deletableOption);
};

const registerMovable = function (weight) {
  const movableOption = {
    displayText: function (scope) {
      // isMovable is a built in Blockly function that checks whether the block
      // is movable or not.
      return scope.block.isMovable()
        ? 'Make Immovable to Users'
        : 'Make Movable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope) {
      scope.block.setMovable(!scope.block.isMovable());
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockMovable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(movableOption);
};

const registerEditable = function (weight) {
  const editableOption = {
    displayText: function (scope) {
      // isEditable is a built in Blockly function that checks whether the block
      // is editable or not.
      return scope.block.isEditable()
        ? 'Make Uneditable to Users'
        : 'Make Editable to Users';
    },
    preconditionFn: function () {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope) {
      scope.block.setEditable(!scope.block.isEditable());
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockEditable',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(editableOption);
};

const registerShadow = function (weight) {
  const shadowOption = {
    displayText: () => 'Make Shadow',
    preconditionFn: function (scope) {
      if (Blockly.isStartMode && canBeShadow(scope.block)) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope) {
      scope.block.setShadow(true);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockToShadow',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(shadowOption);
};
const registerUnshadow = function (weight) {
  const unshadowOption = {
    // If there's 1 child, text should be 'Make Child Block Non-Shadow'
    // If there's n children, text should be `Make ${n} Child Blocks Non-Shadow`
    displayText: function (scope) {
      const displayText = `Make ${
        shadowChildCount(scope.block) > 1
          ? `${shadowChildCount(scope.block)} `
          : ''
      }Child Block${shadowChildCount(scope.block) > 1 ? 's' : ''} Non-Shadow`;
      return displayText;
    },
    preconditionFn: function (scope) {
      if (Blockly.isStartMode && hasShadowChildren(scope.block)) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function (scope) {
      scope.block.getChildren().forEach(child => child.setShadow(false));
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'childUnshadow',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(unshadowOption);
};

const registerKeyboardNavigation = function (weight) {
  const keyboardNavigationOption = {
    displayText: function (scope) {
      return scope.workspace.keyboardAccessibilityMode
        ? msg.blocklyKBNavOff()
        : msg.blocklyKBNavOn();
    },
    preconditionFn: function () {
      return Blockly.navigationController
        ? MenuOptionStates.ENABLED
        : MenuOptionStates.HIDDEN;
    },
    callback: function (scope) {
      const controller = Blockly.navigationController;
      if (scope.workspace.keyboardAccessibilityMode) {
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
const registerCursor = function (cursorType, weight) {
  const cursorOption = {
    displayText: function () {
      return isCurrentCursor(cursorType)
        ? `✓ ${msg.usingCursorType({type: cursorType})}`
        : `${msg.useCursorType({type: cursorType})}`;
    },
    preconditionFn: function (scope) {
      if (
        !experiments.isEnabled(experiments.KEYBOARD_NAVIGATION) ||
        !scope.workspace.keyboardAccessibilityMode
      ) {
        return MenuOptionStates.HIDDEN;
      } else if (isCurrentCursor(cursorType)) {
        return MenuOptionStates.DISABLED;
      } else {
        return MenuOptionStates.ENABLED;
      }
    },
    callback: function (scope) {
      localStorage.setItem(BLOCKLY_CURSOR, cursorType);
      Blockly.navigationController.cursorType = cursorType;
      setNewCursor(cursorType, scope);
      Blockly.navigationController.navigation.focusWorkspace(scope.workspace);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: cursorType + 'CursorOption',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(cursorOption);
};

/**
 * Toggle workspace theme between light/dark components
 */
const registerDarkMode = function (weight) {
  const toggleDarkModeOption = {
    displayText: function (scope) {
      return isDarkTheme(scope.workspace)
        ? msg.blocklyTurnOffDarkMode()
        : msg.blocklyTurnOnDarkMode();
    },
    preconditionFn: function () {
      return MenuOptionStates.ENABLED;
    },
    callback: function (scope) {
      const currentTheme = scope.workspace.getTheme();
      const themeName =
        baseName(currentTheme.name) +
        (isDarkTheme(scope.workspace) ? '' : dark);
      localStorage.setItem(BLOCKLY_THEME, themeName);
      setAllWorkspacesTheme(Blockly.themes[themeName], currentTheme);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'toggleDarkMode',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(toggleDarkModeOption);
};

const themes = [
  {
    name: Themes.MODERN,
    label: msg.blocklyModernTheme(),
  },
  {
    name: Themes.HIGH_CONTRAST,
    label: msg.blocklyHighContrastTheme(),
  },
  {
    name: Themes.PROTANOPIA,
    label: msg.blocklyProtanopiaTheme(),
  },
  {
    name: Themes.DEUTERANOPIA,
    label: msg.blocklyDeuteranopiaTheme(),
  },
  {
    name: Themes.TRITANOPIA,
    label: msg.blocklyTritanopiaTheme(),
  },
];
const cursors = ['default', 'basic', 'line'];
/**
 * Change workspace theme to specified theme
 */
const registerTheme = function (name, label, weight) {
  const themeOption = {
    displayText: function (scope) {
      return (
        (isCurrentTheme(name, scope.workspace) ? '✓ ' : `${msg.enable()} `) +
        label
      );
    },
    preconditionFn: function (scope) {
      if (isCurrentTheme(name, scope.workspace)) {
        return MenuOptionStates.DISABLED;
      } else {
        return MenuOptionStates.ENABLED;
      }
    },
    callback: function (scope) {
      const currentTheme = scope.workspace.getTheme();
      const themeName = name + (isDarkTheme(scope.workspace) ? dark : '');
      localStorage.setItem(BLOCKLY_THEME, themeName);
      setAllWorkspacesTheme(Blockly.themes[themeName], currentTheme);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: name + 'ThemeOption',
    weight,
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(themeOption);
};

function registerThemes(startingWeight, themes) {
  themes.forEach((theme, index) => {
    const weight = startingWeight + index;
    registerTheme(theme.name, theme.label, weight);
  });
}

/**
 * Option to open help for a block.
 */
export function registerHelp(weight) {
  const helpOption = {
    displayText() {
      return msg.getBlockDocs();
    },
    preconditionFn(scope) {
      // This option is limited to an experiment until SL documentation is updated.
      if (!experiments.isEnabled(experiments.SPRITE_LAB_DOCS)) {
        return 'hidden';
      }
      const block = scope.block;
      const url =
        typeof block.helpUrl === 'function' ? block.helpUrl() : block.helpUrl;
      // Some common Blockly blocks have help URLs for pages on Wikipedia, GitHub, etc.
      // We only want to allow a documentation dialog for one of our local docs links.
      if (url && url.startsWith('/docs/')) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback(scope) {
      const block = scope.block;
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

const registerAllContextMenuItems = function () {
  unregisterDefaultOptions();

  // Expected registered block options (from Core and plugins):
  // 0: blockCopyToStorage
  // 2: blockComment
  // 5: blockDisable
  // 6: blockDelete
  let nextBlockOptionWeight = 7;

  // Expected registered workspace options (from Core and plugins):
  // 0: blockPasteFromStorage
  // 1: undoWorkspace
  // 2: redoWorkspace
  let nextWorkspaceOptionWeight = 3;

  // Custom block options
  registerHelp(nextBlockOptionWeight++);
  registerDeletable(nextBlockOptionWeight++);
  registerMovable(nextBlockOptionWeight++);
  registerEditable(nextBlockOptionWeight++);
  registerShadow(nextBlockOptionWeight++);
  registerUnshadow(nextBlockOptionWeight);

  // Custom workspace options
  registerKeyboardNavigation(nextWorkspaceOptionWeight++);
  registerAllCursors(nextWorkspaceOptionWeight, cursors);
  nextWorkspaceOptionWeight += cursors.length;
  registerDarkMode(nextWorkspaceOptionWeight++);
  registerThemes(nextWorkspaceOptionWeight, themes);
};

function canBeShadow(block) {
  return (
    block.getSurroundParent() &&
    !block.getVarModels().length &&
    !nonShadowChildCount(block)
  );
}

function shadowChildCount(block) {
  return block.getChildren().filter(child => child.isShadow()).length;
}

function nonShadowChildCount(block) {
  return block.getChildren().filter(child => !child.isShadow()).length;
}

function hasShadowChildren(block) {
  return shadowChildCount(block) > 0;
}

function isCurrentTheme(theme, workspace) {
  return baseName(workspace?.getTheme().name) === baseName(theme);
}

function isDarkTheme(workspace) {
  return workspace?.getTheme().name.includes(dark);
}

function baseName(themeName) {
  return themeName.replace(dark, '');
}

function setAllWorkspacesTheme(newTheme, previousTheme) {
  Blockly.Workspace.getAll().forEach(workspace => {
    // Headless workspaces do not have the ability to set the theme.
    if (typeof workspace.setTheme === 'function') {
      workspace.setTheme(newTheme);
      // Re-render blocks if the font size changed.
      // Once https://github.com/google/blockly/issues/7782 is resolved,
      // we should be able to remove this.
      if (newTheme.fontStyle?.size !== previousTheme.fontStyle?.size) {
        workspace.getAllBlocks().map(block => {
          block.markDirty();
          block.render();
        });
      }
    }
  });
}

function unregisterDefaultOptions() {
  // Remove some default context menu options, if they are present.
  // This needs to be wrapped in a try for now because our GoogleBlocklyWrapperTest.js
  // is not correctly cleaning up its state.
  try {
    GoogleBlockly.ContextMenuRegistry.registry.unregister(
      'blockCollapseExpand'
    );
    GoogleBlockly.ContextMenuRegistry.registry.unregister('blockHelp');
    GoogleBlockly.ContextMenuRegistry.registry.unregister('blockInline');
    // cleanUp() doesn't currently account for immovable blocks.
    GoogleBlockly.ContextMenuRegistry.registry.unregister('cleanWorkspace');
    GoogleBlockly.ContextMenuRegistry.registry.unregister('collapseWorkspace');
    GoogleBlockly.ContextMenuRegistry.registry.unregister('expandWorkspace');
    GoogleBlockly.ContextMenuRegistry.registry.unregister('workspaceDelete');
  } catch (error) {}
}

function registerAllCursors(startingWeight, cursorTypes) {
  cursorTypes.forEach((cursorType, index) => {
    const weight = startingWeight + index;
    registerCursor(cursorType, weight);
  });
}

function isCurrentCursor(cursorType) {
  const currentCursorType = Blockly.navigationController.cursorType;
  return cursorType === currentCursorType;
}

function setNewCursor(type, scope) {
  Blockly.navigationController.cursorType = type;
  const markerManager = Blockly.getMainWorkspace().getMarkerManager();
  const oldCurNode = markerManager.getCursor().getCurNode();
  Blockly.getMainWorkspace()
    .getMarkerManager()
    .setCursor(Blockly.getNewCursor(type));
  if (Blockly.getFunctionEditorWorkspace()) {
    Blockly.getFunctionEditorWorkspace()
      .getMarkerManager()
      .setCursor(Blockly.getNewCursor(type));
  }
  if (oldCurNode) {
    markerManager.getCursor().setCurNode(oldCurNode);
  }
}

exports.registerAllContextMenuItems = registerAllContextMenuItems;
