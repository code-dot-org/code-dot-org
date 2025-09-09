import {KeyboardNavigation} from '@blockly/keyboard-navigation';
import * as GoogleBlockly from 'blockly/core';
import './shortcutMenuStyles.scss';

// This is a Monkey patch while Blockly fixes issue #713. Once merged and
// bumped, we can replace this class and the manual registry of
// NavigationDeferringToolbox below with one line function.
export class NavigationDeferringToolbox extends GoogleBlockly.Toolbox {
  protected override onKeyDown_(e: KeyboardEvent) {}
}

// Covers functions that need to be called prior to Blockly Inject. Because
// we initialize and dispose here, we need to call these ourselves.
export function preInjectRegistrations() {
  KeyboardNavigation.registerKeyboardNavigationStyles();
  GoogleBlockly.registry.register(
    GoogleBlockly.registry.Type.TOOLBOX,
    GoogleBlockly.registry.DEFAULT,
    NavigationDeferringToolbox,
    true
  );
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
