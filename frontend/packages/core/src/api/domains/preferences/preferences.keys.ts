export const preferencesKeys = {
  all: ['preferences'] as const,

  usingTextMode: () => [...preferencesKeys.all, 'usingTextMode'] as const,
  displayTheme: () => [...preferencesKeys.all, 'displayTheme'] as const,
  muteMusic: () => [...preferencesKeys.all, 'muteMusic'] as const,
  hasDismissedPersonalizationAlert: () =>
    [...preferencesKeys.all, 'hasDismissedPersonalizationAlert'] as const,

  fontSizes: () => [...preferencesKeys.all, 'fontSize'] as const,
  consoleFontSize: (appName: string) =>
    [...preferencesKeys.fontSizes(), 'console', appName] as const,
  editorFontSize: (appName: string) =>
    [...preferencesKeys.fontSizes(), 'editor', appName] as const,

  themeSettings: () => [...preferencesKeys.all, 'themeSettings'] as const,
};
