import {KeyboardNavigation} from '@blockly/keyboard-navigation';
import * as GoogleBlockly from 'blockly/core';

export function initializeKeyboardNavigation(
  workspace: GoogleBlockly.WorkspaceSvg,
  theme: GoogleBlockly.Theme
) {
  unregisterShortcuts(['undo', 'redo']);
  backupShortcuts(['copy', 'paste', 'cut']);
  if (Blockly.KeyboardNavigation) {
    unregisterShortcuts(['undo', 'redo']);
    Blockly.KeyboardNavigation.dispose();
    restoreShortcuts(['copy', 'paste', 'cut']);
  }

  createShortcutsModalContainer();
  Blockly.KeyboardNavigation = new KeyboardNavigation(workspace);

  enableShortcutModalEscape();
  // Rerun user theme after Keyboard Experiment bug introduces incorrect theme
  workspace.setTheme(Blockly.cdoUtils.getUserTheme(theme));
}

function unregisterShortcuts(shortcutNames: string[]) {
  shortcutNames.forEach(name => {
    if (Blockly.ShortcutRegistry.registry.getRegistry()[name]) {
      Blockly.ShortcutRegistry.registry.unregister(name);
    }
  });
}

function backupShortcuts(shortcutNames: string[]) {
  if (!Blockly.shortcutBackups) {
    Blockly.shortcutBackups = {};
  }
  shortcutNames.forEach(name => {
    if (!Blockly.shortcutBackups[name]) {
      Blockly.shortcutBackups[name] =
        Blockly.ShortcutRegistry.registry.getRegistry()[name];
    }
  });
}

function restoreShortcuts(shortcutNames: string[]) {
  shortcutNames.forEach(name => {
    if (Blockly.shortcutBackups[name]) {
      Blockly.ShortcutRegistry.registry.register(Blockly.shortcutBackups[name]);
    }
  });
}

function createShortcutsModalContainer() {
  // Add the shortcuts div prior to keyboard navigation initialization
  // so the dialog has a place to land.
  if (!document.getElementById('shortcuts')) {
    const shortcutDialog = document.createElement('div');
    shortcutDialog.id = 'shortcuts';
    document.body.appendChild(shortcutDialog);
  }
}
function enableShortcutModalEscape() {
  // Now that the shortcutModal is initialized, we can add a keydown
  // event listener to the modal to close it when the Escape key is pressed.
  const shortcutModal = document.querySelector('.shortcut-modal');
  if (shortcutModal) {
    shortcutModal.addEventListener('keydown', event => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.stopPropagation();
        // Simulate a click on the close button to mimic the behavior
        const closeButton = document.querySelector(
          '.close-modal'
        ) as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    });
  }
}
