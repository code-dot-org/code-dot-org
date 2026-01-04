import * as Blockly from 'blockly/core';

export const DARK_THEME_SUFFIX = 'dark';
export function isDarkTheme(theme: Blockly.Theme | undefined): boolean {
  return !!theme?.name.includes(DARK_THEME_SUFFIX);
}

export {default as DefaultTheme} from './default';
