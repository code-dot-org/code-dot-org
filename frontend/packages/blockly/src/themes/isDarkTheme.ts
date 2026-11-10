import type * as Blockly from 'blockly/core';

export const DARK_THEME_SUFFIX = 'dark';

/** Whether a Blockly theme is a dark variant: its name contains `dark`. */
export function isDarkTheme(theme: Blockly.Theme | undefined): boolean {
  return !!theme?.name.includes(DARK_THEME_SUFFIX);
}
