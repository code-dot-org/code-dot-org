// Lives in its own module so AudioRecorder can consume it without
// importing AssetManager, which imports AudioRecorder back — the last
// real cycle between the two.
export const AudioErrorType = {
  NONE: 'none',
  INITIALIZE: 'initialize',
  SAVE: 'save',
};
