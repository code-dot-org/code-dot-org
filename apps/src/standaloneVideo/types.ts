// TODO: Ideally this type would only contain keys present in
// translated string JSON files (ex. apps/i18n/standaloneVideo/en_us.json).
// However, this requires depending on files outside of apps/src,
// so this approach is still being investigated. For now, this type
// is an object whose keys are all functions which return strings,
// matching what we expect for a locale object.
export type StandaloneVideoLocale = {
  [key: string]: () => string;
};
