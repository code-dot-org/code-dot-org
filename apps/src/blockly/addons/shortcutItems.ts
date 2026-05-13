import * as BlocklyCore from 'blockly/core';

/**
 * Adds a keyboard shortcut that close the modal function editor when escape is pressed.
 */
export function registerCloseModalEditorShortcut(
  callback: (
    p1: BlocklyCore.WorkspaceSvg,
    p2: Event,
    p3: BlocklyCore.ShortcutRegistry.KeyboardShortcut
  ) => boolean
) {
  const closeModalEditorShortcut: BlocklyCore.ShortcutRegistry.KeyboardShortcut =
    {
      name: 'close_modal_editor',
      preconditionFn: function () {
        return true;
      },
      callback,
      keyCodes: [BlocklyCore.utils.KeyCodes.ESC],
      allowCollision: true,
    };

  BlocklyCore.ShortcutRegistry.registry.register(
    closeModalEditorShortcut,
    true
  );
}
