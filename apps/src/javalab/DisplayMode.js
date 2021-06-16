export const DisplayMode = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const DEFAULT_DISPLAY_MODE = DisplayMode.DARK;

export const getDisplayModeFromString = displayModeString => {
  if (displayModeString === null || displayModeString === undefined) {
    return DEFAULT_DISPLAY_MODE;
  }

  for (let possibleDisplayMode of Object.keys(DisplayMode)) {
    if (
      displayModeString.toLowerCase().trim() ===
      DisplayMode[possibleDisplayMode].toLowerCase().trim()
    ) {
      return DisplayMode[possibleDisplayMode];
    }
  }

  return DEFAULT_DISPLAY_MODE;
};
