export function highlightBlock(id: string, spotlight: boolean) {
  // Blockly doesn't consider the selected block to be a highlighted block,
  // so we unselect it first.
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  Blockly.getMainWorkspace().highlightBlock(id, spotlight);
}
