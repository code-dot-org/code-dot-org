import type {LocationInput} from '../types';

import {defineCommands} from './defineCommands';

export const commands = defineCommands({
  // Since hiding the variable doesn't require the JSInterpreter, we can ignore
  // the name argument returned by the variableFieldNamePicker
  hideVariable(labelArg: string) {
    if (!labelArg) {
      return;
    }
    this.removeVariableBubble(labelArg);
  },

  showVariable(labelArg: string, nameArg: string, locationArg: LocationInput) {
    if (!labelArg || !nameArg) {
      return;
    }
    this.addVariableBubble(labelArg, nameArg, locationArg);
  },
});
