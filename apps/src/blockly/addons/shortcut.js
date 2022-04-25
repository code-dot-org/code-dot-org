import GoogleBlockly from 'blockly/core';

/**
 * Adds a keyboard shortcut that will store copy information for a block
 * in localStorage. After switching to v7, we can replace this file with:
 * https://github.com/google/blockly-samples/tree/master/plugins/cross-tab-copy-paste
 */
const blockCopyToStorageShortcut = function() {
  const copyShortcut = {
    name: 'copy',
    preconditionFn: function(workspace) {
      return (
        !workspace.options.readOnly &&
        !GoogleBlockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable()
      );
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior,
      // which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const blockText = Blockly.Xml.domToPrettyText(
        Blockly.Xml.blockToDom(Blockly.selected)
      );
      localStorage.setItem('blocklyStash', blockText);
      return true;
    }
  };
  GoogleBlockly.ShortcutRegistry.registry.unregister(
    GoogleBlockly.ShortcutItems.names.COPY
  );
  GoogleBlockly.ShortcutRegistry.registry.register(copyShortcut);

  const ctrlC = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.C,
    [GoogleBlockly.utils.KeyCodes.CTRL]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    ctrlC,
    copyShortcut.name
  );

  const altC = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.C,
    [GoogleBlockly.utils.KeyCodes.ALT]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    altC,
    copyShortcut.name
  );

  const metaC = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.C,
    [GoogleBlockly.utils.KeyCodes.META]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    metaC,
    copyShortcut.name
  );
};

/**
 * Adds a keyboard shortcut that will store copy information for a block
 * in local storage and delete the block.
 */
const blockCutToStorageShortcut = function() {
  const cutShortcut = {
    name: 'cut',
    preconditionFn: function(workspace) {
      return (
        !workspace.options.readOnly &&
        !GoogleBlockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable() &&
        !Blockly.selected.workspace.isFlyout
      );
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior,
      // which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const blockText = Blockly.Xml.domToPrettyText(
        Blockly.Xml.blockToDom(Blockly.selected)
      );
      localStorage.setItem('blocklyStash', blockText);
      localStorage.getItem('blocklyStash');
      Blockly.Events.setGroup(true);
      Blockly.selected.dispose(true);
      Blockly.Events.setGroup(false);
      return true;
    }
  };
  GoogleBlockly.ShortcutRegistry.registry.unregister(
    GoogleBlockly.ShortcutItems.names.CUT
  );
  GoogleBlockly.ShortcutRegistry.registry.register(cutShortcut);

  const ctrlX = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.X,
    [GoogleBlockly.utils.KeyCodes.CTRL]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    ctrlX,
    cutShortcut.name
  );

  const altX = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.X,
    [GoogleBlockly.utils.KeyCodes.ALT]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  const metaX = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.X,
    [GoogleBlockly.utils.KeyCodes.META]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    metaX,
    cutShortcut.name
  );
};

/**
 * Adds a keyboard shortcut that will paste the block stored in localStorage.
 */
const blockPasteFromStorageShortcut = function() {
  const pasteShortcut = {
    name: 'paste',
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || GoogleBlockly.Gesture.inProgress()) {
        return false;
      }
      const copyData = localStorage.getItem('blocklyStash');
      if (!copyData || !workspace.isCapacityAvailable(copyData.typeCounts)) {
        return false;
      }
      return true;
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior,
      // which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const blockText = localStorage.getItem('blocklyStash');
      Blockly.Xml.domToBlockSpace(
        Blockly.mainBlockSpace,
        Blockly.Xml.textToDom(`<xml>${blockText}</xml>`)
      );
      return true;
    }
  };
  GoogleBlockly.ShortcutRegistry.registry.unregister(
    GoogleBlockly.ShortcutItems.names.PASTE
  );
  GoogleBlockly.ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.V,
    [GoogleBlockly.utils.KeyCodes.CTRL]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    ctrlV,
    pasteShortcut.name
  );

  const altV = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.V,
    [GoogleBlockly.utils.KeyCodes.ALT]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    altV,
    pasteShortcut.name
  );

  const metaV = GoogleBlockly.ShortcutRegistry.registry.createSerializedKey(
    GoogleBlockly.utils.KeyCodes.V,
    [GoogleBlockly.utils.KeyCodes.META]
  );
  GoogleBlockly.ShortcutRegistry.registry.addKeyMapping(
    metaV,
    pasteShortcut.name
  );
};

const registerAllShortcutItems = function() {
  blockCopyToStorageShortcut();
  blockCutToStorageShortcut();
  blockPasteFromStorageShortcut();
};

exports.registerAllShortcutItems = registerAllShortcutItems;
