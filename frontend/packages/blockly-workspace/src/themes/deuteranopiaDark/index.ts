import DarkTheme from '@blockly/theme-dark';
import * as Blockly from 'blockly/core';

import {definition as DarkDefinition} from '../dark';
import {definition as DeuteranopiaDefinition} from '../deuteranopia';

/**
 * This blockly theme is used to provide a constrasting palette for those with varying ability to distinguish red and green colors.
 */
export const definition = {
  ...DarkDefinition,
  name: 'deuteranopia-dark',
  option: 'Deuteranopia Dark Theme',
  blockStyles: {
    ...DeuteranopiaDefinition.blockStyles,
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
