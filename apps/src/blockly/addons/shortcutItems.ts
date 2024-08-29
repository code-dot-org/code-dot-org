import GoogleBlockly, {WorkspaceSvg} from 'blockly/core';
import {KeyboardShortcut} from 'blockly/core/shortcut_registry';

/**
 * Adds a keyboard shortcut that close the modal function editor when escape is pressed.
 */
export function registerCloseModalEditorShortcut(
  callback: (p1: WorkspaceSvg, p2: Event, p3: KeyboardShortcut) => boolean
) {
  const closeModalEditorShortcut: KeyboardShortcut = {
    name: 'close_modal_editor',
    preconditionFn: function () {
      return true;
    },
    callback,
    keyCodes: [GoogleBlockly.utils.KeyCodes.ESC],
    allowCollision: true,
  };

  GoogleBlockly.ShortcutRegistry.registry.register(
    closeModalEditorShortcut,
    true
  );
}
