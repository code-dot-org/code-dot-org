export const commands = {
  // Since hiding the variable doesn't require the JSInterpreter, we can ignore
  // the name argument returned by the variableFieldNamePicker
  hideVariable(labelArg, nameArg) {
    console.log('labelArg', labelArg);
    if (!labelArg) {
      return;
    }
    this.removeVariableBubble(labelArg);
  },

  showVariable(labelArg, nameArg, locationArg) {
    if (!labelArg || !nameArg) {
      return;
    }
    this.addVariableBubble(labelArg, nameArg, locationArg);
  },
};
