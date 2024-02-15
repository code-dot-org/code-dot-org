export const commands = {
  hideVariable(nameArg) {
    if (!nameArg) {
      return;
    }
    this.removeVariableBubble(nameArg);
  },

  // Verify what happens with Blockly name vs. regular name
  showVariable(nameArg, locationArg) {
    if (!nameArg) {
      return;
    }
    this.addVariableBubble(nameArg, locationArg);
  },
};
