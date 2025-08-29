import {KeyboardNavigation} from '@blockly/keyboard-navigation';
import * as GoogleBlockly from 'blockly/core';
import './shortcutMenuStyles.scss';

export function registerKeyboardNavigationStyles() {
  KeyboardNavigation.registerKeyboardNavigationStyles();
}

export function initializeKeyboardNavigation(
  workspace: GoogleBlockly.WorkspaceSvg
) {
  if (Blockly.KeyboardNavigation) {
    Blockly.KeyboardNavigation.dispose();
  }
  createShortcutsModalContainer();
  Blockly.KeyboardNavigation = new KeyboardNavigation(workspace);

  enableShortcutModalEscape();
}

function createShortcutsModalContainer() {
  // Add the shortcuts div prior to keyboard navigation initialization
  // so the dialog has a place to land.
  if (!document.getElementById('shortcuts')) {
    const shortcutDialog = document.createElement('div');
    shortcutDialog.id = 'shortcuts';
    shortcutDialog.className = 'shortcut-dialog';
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
