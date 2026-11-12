import * as BlocklyCore from 'blockly/core';

/**
 * Tells Blockly the student is using a pointer, so that it stops drawing
 * its keyboard navigation rings around the workspace.
 *
 * Blockly starts keyboard navigation when an arrow key is pressed with the
 * workspace focused, and a plain click does not end it. A student who has
 * been steering the game with the arrow keys tends to press them in the
 * editor too, and so starts it without meaning to. It starts again at the
 * next arrow key pressed in the workspace, so a student who does use the
 * keyboard keeps the rings.
 */
export function endKeyboardNavigation(): void {
  BlocklyCore.keyboardNavigationController.setIsActive(false);
}
