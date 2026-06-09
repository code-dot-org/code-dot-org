/** Pixel dimensions and timing constants shared across the lab. */
const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200,
  fishFrameSize: 210,
  defaultMoveTime: 1000,
  maxPondFish: 20,
  /** Minimum time (ms) the loading screen is shown before transitioning. */
  minLoadingTime: 1500,
} as const;

export default constants;

/** All playable app modes, keyed by friendly name. */
export const AppMode = Object.freeze({
  FishVTrash: 'fishvtrash',
  CreaturesVTrashDemo: 'creaturesvtrashdemo',
  CreaturesVTrash: 'creaturesvtrash',
  FishShort: 'short',
  FishLong: 'long',
});

/** Valid AppMode string values. */
export type AppModeValue = (typeof AppMode)[keyof typeof AppMode];

/** All UI modes the lab can be in during a session. */
export const Modes = Object.freeze({
  Loading: 0,
  Words: 1,
  Training: 2,
  Predicting: 3,
  Pond: 4,
  Instructions: 5,
  IntermediateLoading: 6,
});

/** Valid Mode integer values. */
export type ModeValue = (typeof Modes)[keyof typeof Modes];

/** Classification label: Like (0) or Dislike (1). */
export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1,
});

/** Valid ClassType integer values. */
export type ClassTypeValue = (typeof ClassType)[keyof typeof ClassType];

/** DOM id of the React UI container div rendered inside OceansLab. */
export const OCEANS_UI_CONTAINER_ID = 'container-react';
