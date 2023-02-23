import GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';

import {Themes, MenuOptionStates, BLOCKLY_THEME} from '../constants.js';
const registerDeletable = function() {
  const deletableOption = {
    displayText: function(scope) {
      // isDeletale is a built in Blockly function that checks whether the block
      // is deletable, is not a shadow, and if the workspace is readonly.
      return scope.block.isDeletable()
        ? 'Make Undeletable to Users'
        : 'Make Deletable to Users';
    },
    preconditionFn: function() {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function(scope) {
      scope.block.setDeletable(!scope.block.isDeletable());
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDeletable',
    weight: 6
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(deletableOption);
};

const registerMovable = function() {
  const movableOption = {
    displayText: function(scope) {
      // isMovable is a built in Blockly function that checks whether the block
      // is movable or not.
      return scope.block.isMovable()
        ? 'Make Immovable to Users'
        : 'Make Movable to Users';
    },
    preconditionFn: function() {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function(scope) {
      scope.block.setMovable(!scope.block.isMovable());
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockMovable',
    weight: 7
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(movableOption);
};

const registerEditable = function() {
  const editableOption = {
    displayText: function(scope) {
      // isEditable is a built in Blockly function that checks whether the block
      // is editable or not.
      return scope.block.isEditable()
        ? 'Make Uneditable to Users'
        : 'Make Editable to Users';
    },
    preconditionFn: function() {
      if (Blockly.isStartMode) {
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function(scope) {
      scope.block.setEditable(!scope.block.isEditable());
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockEditable',
    weight: 8
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(editableOption);
};

const registerShadow = function() {
  const shadowOption = {
    displayText: () => 'Make Shadow',
    preconditionFn: function(scope) {
      if (Blockly.isStartMode && canBeShadow(scope.block)) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function(scope) {
      scope.block.setShadow(true);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockToShadow',
    weight: 9
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(shadowOption);
};
const registerUnshadow = function() {
  const unshadowOption = {
    // If there's 1 child, text should be 'Make Child Block Non-Shadow'
    // If there's n children, text should be `Make ${n} Child Blocks Non-Shadow`
    displayText: function(scope) {
      const displayText = `Make ${
        shadowChildCount(scope.block) > 1
          ? `${shadowChildCount(scope.block)} `
          : ''
      }Child Block${shadowChildCount(scope.block) > 1 ? 's' : ''} Non-Shadow`;
      return displayText;
    },
    preconditionFn: function(scope) {
      if (Blockly.isStartMode && hasShadowChildren(scope.block)) {
        // isShadow is a built in Blockly function that checks whether the block
        // is a shadow or not.
        return MenuOptionStates.ENABLED;
      }
      return MenuOptionStates.HIDDEN;
    },
    callback: function(scope) {
      scope.block.getChildren().forEach(child => child.setShadow(false));
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'childUnshadow',
    weight: 10
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(unshadowOption);
};

const registerKeyboardNavigation = function() {
  const keyboardNavigationOption = {
    displayText: function(scope) {
      return scope.workspace.keyboardAccessibilityMode
        ? msg.blocklyKBNavOff()
        : msg.blocklyKBNavOn();
    },
    preconditionFn: function() {
      return Blockly.navigationController
        ? MenuOptionStates.ENABLED
        : MenuOptionStates.HIDDEN;
    },
    callback: function(scope) {
      const controller = Blockly.navigationController;
      scope.workspace.keyboardAccessibilityMode
        ? controller.disable(scope.workspace)
        : controller.enable(scope.workspace);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'keyboardNavigation',
    weight: 11
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(keyboardNavigationOption);
};

const themes = [
  {
    name: Themes.MODERN,
    label: msg.blocklyModernTheme()
  },
  {
    name: Themes.DARK,
    label: msg.blocklyDarkTheme()
  },
  {
    name: Themes.HIGH_CONTRAST,
    label: msg.blocklyHighContrastTheme()
  },
  {
    name: Themes.ACCESSIBLE,
    label: msg.blocklyAccessibleTheme()
  }
];
/**
 * Change workspace theme to specified theme
 */
const registerTheme = function(name, label, index) {
  const themeOption = {
    displayText: function(scope) {
      return (
        (isCurrentTheme(name, scope.workspace) ? '✓ ' : `${msg.enable()} `) +
        label
      );
    },
    preconditionFn: function(scope) {
      if (isMusicLabTheme(scope.workspace)) {
        return MenuOptionStates.HIDDEN;
      } else if (isCurrentTheme(name, scope.workspace)) {
        return MenuOptionStates.DISABLED;
      } else {
        return MenuOptionStates.ENABLED;
      }
    },
    callback: function(scope) {
      localStorage.setItem(BLOCKLY_THEME, name);
      scope.workspace.setTheme(Blockly.themes[name]);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: name + 'ThemeOption',
    weight: 12 + index
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(themeOption);
};

function registerThemes(themes) {
  themes.forEach((theme, index) => {
    registerTheme(theme.name, theme.label, index);
  });
}

const registerAllContextMenuItems = function() {
  registerDeletable();
  registerMovable();
  registerEditable();
  registerShadow();
  registerUnshadow();
  registerKeyboardNavigation();
  registerThemes(themes);
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
  return (
    workspace?.getTheme().name === theme ||
    localStorage.getItem(BLOCKLY_THEME) === theme
  );
}

function isMusicLabTheme(workspace) {
  return workspace.getTheme().name === Themes.MUSICLAB_DARK;
}

exports.registerAllContextMenuItems = registerAllContextMenuItems;
