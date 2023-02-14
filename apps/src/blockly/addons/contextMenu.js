import GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';

/**
 * Adds a copy command to the block context menu. After switching to v7,
 * we can replace this with:
 * https://github.com/google/blockly-samples/tree/master/plugins/cross-tab-copy-paste
 */
const registerBlockCopyToStorage = function() {
  const copyToStorageOption = {
    displayText: function() {
      return msg.copy();
    },
    preconditionFn: function(scope) {
      if (scope.block.isDeletable() && scope.block.isMovable()) {
        return 'enabled';
      } else {
        return 'disabled';
      }
    },
    callback: function(scope) {
      const copyData = JSON.stringify(Blockly.selected.toCopyData().saveInfo);
      localStorage.setItem('blocklyStash', copyData);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockCopyToStorage',
    weight: 0
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(copyToStorageOption);
};

/**
 * Adds a paste command to the block context menu. After switching to v7,
 * we can replace this with:
 * https://github.com/google/blockly-samples/tree/master/plugins/cross-tab-copy-paste
 */
const registerBlockPasteFromStorage = function() {
  const pasteFromStorageOption = {
    displayText: function() {
      return msg.paste();
    },
    preconditionFn: function(scope) {
      const copyData = localStorage.getItem('blocklyStash');
      if (copyData) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function(scope) {
      const copyData = localStorage.getItem('blocklyStash');
      Blockly.mainBlockSpace.paste(JSON.parse(copyData));
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'blockPasteFromStorage',
    weight: 0
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(pasteFromStorageOption);
};

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
        return 'enabled';
      }
      return 'hidden';
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
        return 'enabled';
      }
      return 'hidden';
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
        return 'enabled';
      }
      return 'hidden';
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
        return 'enabled';
      }
      return 'hidden';
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
        return 'enabled';
      }
      return 'hidden';
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
      return Blockly.navigationController ? 'enabled' : 'hidden';
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

/**
 * Change workspace theme to modern CdoTheme
 */
const registerCdoTheme = function() {
  const cdoThemeOption = {
    displayText: function(scope) {
      return (
        (isCurrentTheme('modern', scope.workspace)
          ? '✓ '
          : `${msg.enable()} `) + msg.blocklyClassicTheme()
      );
    },
    preconditionFn: function(scope) {
      if (isMusicLabTheme(scope.workspace)) {
        return 'hidden';
      } else if (isCurrentTheme('modern', scope.workspace)) {
        return 'disabled';
      } else {
        return 'enabled';
      }
    },
    callback: function(scope) {
      localStorage.setItem('blocklyTheme', 'modern');
      scope.workspace.setTheme(Blockly.themes.modern);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'defaultTheme',
    weight: 12
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(cdoThemeOption);
};

/**
 * Change workspace theme to CdoDarkTheme
 */
const registerDarkTheme = function() {
  const darkThemeOption = {
    displayText: function(scope) {
      return (
        (isCurrentTheme('dark', scope.workspace) ? '✓ ' : `${msg.enable()} `) +
        msg.blocklyDarkTheme()
      );
    },
    preconditionFn: function(scope) {
      if (isMusicLabTheme(scope.workspace)) {
        return 'hidden';
      } else if (isCurrentTheme('dark', scope.workspace)) {
        return 'disabled';
      } else {
        return 'enabled';
      }
    },
    callback: function(scope) {
      localStorage.setItem('blocklyTheme', 'dark');
      scope.workspace.setTheme(Blockly.themes.dark);
    },
    scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'darkTheme',
    weight: 13
  };
  GoogleBlockly.ContextMenuRegistry.registry.register(darkThemeOption);
};

const registerAllContextMenuItems = function() {
  registerBlockCopyToStorage();
  registerBlockPasteFromStorage();
  registerDeletable();
  registerMovable();
  registerEditable();
  registerShadow();
  registerUnshadow();
  registerKeyboardNavigation();
  registerCdoTheme();
  registerDarkTheme();
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
    localStorage.getItem('blocklyTheme') === theme
  );
}

function isMusicLabTheme(workspace) {
  return workspace.getTheme().name === 'musiclabdark';
}
exports.registerAllContextMenuItems = registerAllContextMenuItems;
