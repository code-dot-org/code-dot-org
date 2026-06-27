import DarkTheme from '@blockly/theme-dark';
import * as Blockly from 'blockly/core';

import {definition as DarkDefinition} from '../dark';
import {definition as ProtanopiaDefinition} from '../protanopia';

/**
 * This blockly theme is used to provide a constrasting palette for those with varying ability to distinguish red and green colors.
 */
export const definition = {
  ...DarkDefinition,
  name: 'protanopia-dark',
  option: 'Protanopia Dark Theme',
  blockStyles: {
    ...ProtanopiaDefinition.blockStyles,
  },
};

const instance = Blockly.Theme.defineTheme(definition.name, {
  base: DarkTheme,
  ...definition,
});

const theme = {
  definition,
  instance,
};

export default theme;
