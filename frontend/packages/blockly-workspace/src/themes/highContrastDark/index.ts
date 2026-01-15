import HighContrastTheme from '@blockly/theme-highcontrast';
import * as Blockly from 'blockly/core';

import {definition as DarkDefinition} from '../dark';
import {definition as HighContrastDefinition} from '../highContrast';

// Give ourselves permission to delete the secondary and tertiary keys of the imported blockly theme
type AlteredBaseTheme = Omit<typeof HighContrastTheme, 'blockStyles'> & {
  blockStyles: {
    [key: string]: Omit<
      (typeof HighContrastTheme)['blockStyles'][string],
      'colourSecondary' | 'colourTertiary'
    > & {
      colourSecondary?: string;
      colourTertiary?: string;
    };
  };
};
const AlteredHighContrastTheme = HighContrastTheme as AlteredBaseTheme;

// Our themes only define the primary colour for each block style.
// By doing this, we allow Blockly to automatically generate secondary and tertiary colors.
// This is important for dark mode as we override the secondary color generation method.
for (const key in AlteredHighContrastTheme.blockStyles) {
  delete AlteredHighContrastTheme.blockStyles[key].colourSecondary;
  delete AlteredHighContrastTheme.blockStyles[key].colourTertiary;
}

/**
 * This blockly theme is used to provide a constrasting palette for those with varying ability to distinguish red and green colors.
 */
export const definition = {
  ...DarkDefinition,
  name: 'high-contrast-dark',
  option: 'High Contrast Dark Theme',
  blockStyles: {
    ...HighContrastDefinition.blockStyles,
  },
};

const instance = Blockly.Theme.defineTheme(definition.name, {
  base: HighContrastTheme,
  ...definition,
});

const theme = {
  definition,
  instance,
};

export default theme;
