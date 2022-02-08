export const DisplayTheme = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const DEFAULT_DISPLAY_THEME = DisplayTheme.DARK;

export const getDisplayThemeFromString = displayThemeString => {
  if (displayThemeString === null || displayThemeString === undefined) {
    return DEFAULT_DISPLAY_THEME;
  }

  for (let possibleDisplayTheme of Object.keys(DisplayTheme)) {
    if (
      displayThemeString.toLowerCase().trim() ===
      DisplayTheme[possibleDisplayTheme].toLowerCase().trim()
    ) {
      return DisplayTheme[possibleDisplayTheme];
    }
  }

  return DEFAULT_DISPLAY_THEME;
};
