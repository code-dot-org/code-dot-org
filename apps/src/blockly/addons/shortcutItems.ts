import * as GoogleBlockly from 'blockly/core';

/**
 * Adds a keyboard shortcut that close the modal function editor when escape is pressed.
 */
export function registerCloseModalEditorShortcut(
  callback: (
    p1: GoogleBlockly.WorkspaceSvg,
    p2: Event,
    p3: GoogleBlockly.ShortcutRegistry.KeyboardShortcut
  ) => boolean
) {
  const closeModalEditorShortcut: GoogleBlockly.ShortcutRegistry.KeyboardShortcut =
    {
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
