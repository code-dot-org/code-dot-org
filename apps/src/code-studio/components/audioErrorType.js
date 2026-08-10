// Do not fold these into AssetManager: modules that AssetManager
// imports need these constants, and importing AssetManager back to get
// them creates an import cycle.
export const AudioErrorType = {
  NONE: 'none',
  INITIALIZE: 'initialize',
  SAVE: 'save',
};
