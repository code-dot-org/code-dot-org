import * as BlocklyCore from 'blockly/core';
import './shortcutMenuStyles.scss';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {
  overrideOptionWeight as overrideContextMenuOptionWeight,
  unregisterCrossTabPluginOptions,
  WeightOptions as ContextMenuWeightOptions,
} from './contextMenu';

// Store the keyboard listener reference for cleanup
let slashKeyListener: ((event: KeyboardEvent) => void) | null = null;

// Track whether our keyboard navigation setup has been run
let keyboardNavigationInitialized = false;

// Monkey patch: prevents toolbox from consuming keydown events so they reach
// the workspace keyboard navigation handler. Still needed per blockly issue #713.
export class NavigationDeferringToolbox extends BlocklyCore.Toolbox {
  protected override onKeyDown_(e: KeyboardEvent) {}
}

// Covers functions that need to be called prior to Blockly Inject.
export function preInjectRegistrations() {
  BlocklyCore.registry.register(
    BlocklyCore.registry.Type.TOOLBOX,
    BlocklyCore.registry.DEFAULT,
    NavigationDeferringToolbox,
    true
  );
}

export function initializeKeyboardNavigation(
  workspace: BlocklyCore.WorkspaceSvg,
  isDarkTheme: boolean
) {
  if (keyboardNavigationInitialized) {
    disableSlashKeyListener();
  }
  unregisterCrossTabPluginOptions();
  createShortcutsModalContainer(isDarkTheme);
  // Blockly 13: keyboard navigation is built-in. Activate cursor visualization.
  BlocklyCore.keyboardNavigationController.setIsActive(true);
  keyboardNavigationInitialized = true;
  // Re-register context menu options with our custom weights.
  reorderContextMenu();
  enableShortcutModalEscape();
  enableSlashKeyListener();
}

export function initializeAdditionalWorkspace(
  workspace: BlocklyCore.WorkspaceSvg
) {
  // Blockly 13: keyboard navigation is workspace-agnostic via the global
  // singleton; no per-workspace initialization is required.
}

function createShortcutsModalContainer(isDarkTheme: boolean) {
  // Add the shortcuts div prior to keyboard navigation initialization
  // so the dialog has a place to land.
  if (!document.getElementById('shortcuts')) {
    const shortcutDialog = document.createElement('div');
    shortcutDialog.id = 'shortcuts';
    shortcutDialog.className = 'shortcut-dialog';
    if (isDarkTheme) {
      shortcutDialog.setAttribute('data-theme', 'Dark');
    }
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

function reorderContextMenu() {
  const menuWeightMap: Record<string, ContextMenuWeightOptions> = {
    blockCutFromContextMenu: ContextMenuWeightOptions.CUT,
    blockCopyFromContextMenu: ContextMenuWeightOptions.COPY,
    blockPasteFromContextMenu: ContextMenuWeightOptions.PASTE,
    move: ContextMenuWeightOptions.MOVE,
    edit: ContextMenuWeightOptions.EDIT,
    move_comment: ContextMenuWeightOptions.MOVE_COMMENT,
  };
  for (const [option, weight] of Object.entries(menuWeightMap)) {
    overrideContextMenuOptionWeight(option, weight);
  }
}

/**
 * Handles the '/' key press event and sends analytics.
 */
function handleSlashKeyPress(event: KeyboardEvent) {
  if (event.key === '/') {
    analyticsReporter.sendEvent(EVENTS.BLOCKLY_SLASH_KEY_PRESSED, {});
  }
}

/**
 * Enables the '/' key listener on the blockly-div element.
 * Removes any existing listener before adding a new one.
 */
function enableSlashKeyListener() {
  const blocklyDiv = document.getElementById('blockly-div');
  if (!blocklyDiv) {
    return;
  }

  // Remove existing listener if present
  if (slashKeyListener) {
    blocklyDiv.removeEventListener('keydown', slashKeyListener);
  }

  // Create and store new listener
  slashKeyListener = handleSlashKeyPress;
  blocklyDiv.addEventListener('keydown', slashKeyListener);
}

/**
 * Removes the '/' key listener from the blockly-div element.
 * This is automatically called when re-initializing keyboard navigation,
 * but can also be called manually if needed during cleanup (e.g., when
 * unmounting a component or disabling keyboard navigation features).
 */
export function disableSlashKeyListener() {
  const blocklyDiv = document.getElementById('blockly-div');
  if (blocklyDiv && slashKeyListener) {
    blocklyDiv.removeEventListener('keydown', slashKeyListener);
    slashKeyListener = null;
  }
}
