export const commands = {
  hideVariable(nameArg) {
    if (!nameArg) {
      return;
    }
    this.removeVariableBubble(nameArg);
  },

  // Verify what happens with Blockly name vs. regular name
  showVariable(labelArg, nameArg, locationArg) {
    if (!labelArg || !nameArg) {
      return;
    }
    this.addVariableBubble(labelArg, nameArg, locationArg);
  },
};
