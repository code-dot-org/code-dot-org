import _ from 'lodash';
import queryString from 'query-string';

import {FishBodyPart} from '../utils/fishData';

import constants, {Modes} from './constants';
import {type State, setState} from './state';

const labBackground = new URL(
  '../assets/images/lab-background.png',
  import.meta.url,
).href;
const waterBackground = new URL(
  '../assets/images/water-background.png',
  import.meta.url,
).href;

/** Returns `Date.now()` or a compatible polyfill. */
export const $time: () => number =
  Date.now ||
  function () {
    return +new Date();
  };

/**
 * Returns the background image URL for the given mode, or `null` if the mode
 * has no background.
 *
 * @param mode - A `Modes` integer value.
 * @returns Absolute image URL or `null`.
 */
export const backgroundPathForMode = (mode: number): string | null => {
  let img: string | undefined;
  if (
    mode === Modes.Words ||
    mode === Modes.Pond ||
    mode === Modes.Predicting
  ) {
    img = waterBackground;
  } else if (mode === Modes.Training) {
    img = labBackground;
  }
  return img ?? null;
};

/**
 * Returns the anchor point `[x, y]` on `body` for the given `FishBodyPart` type.
 *
 * @param body - Fish body data object containing anchor properties.
 * @param type - The body-part type constant.
 * @returns Anchor coordinates as `[x, y]`.
 */
export const bodyAnchorFromType = (
  body: Record<string, [number, number]>,
  type: number,
): [number, number] => {
  switch (type) {
    case FishBodyPart.EYE:
      return body.eyeAnchor;
    case FishBodyPart.MOUTH:
      return body.mouthAnchor;
    case FishBodyPart.DORSAL_FIN:
      return body.dorsalFinAnchor;
    case FishBodyPart.PECTORAL_FIN_FRONT:
      return body.pectoralFinFrontAnchor;
    case FishBodyPart.PECTORAL_FIN_BACK:
      return body.pectoralFinBackAnchor;
    case FishBodyPart.TAIL:
      return body.tailAnchor;
    case FishBodyPart.SCALES:
      return body.scalesAnchor;
    case FishBodyPart.BODY:
      return body.anchor;
    default:
      return [0, 0];
  }
};

/**
 * Returns the palette RGB color for a given fish part, or `null` if the part
 * has no color override.
 *
 * @param palette - Color palette with `finRgb`, `bodyRgb` arrays.
 * @param part - Fish part descriptor with a `type` property.
 * @returns RGB triple or `null`.
 */
export const colorForFishPart = (
  palette: {finRgb: number[]; bodyRgb: number[]},
  part: {type: number},
): number[] | null => {
  switch (part.type) {
    case FishBodyPart.DORSAL_FIN:
    case FishBodyPart.PECTORAL_FIN_FRONT:
    case FishBodyPart.PECTORAL_FIN_BACK:
    case FishBodyPart.TAIL:
      return palette.finRgb;
    case FishBodyPart.BODY:
      return palette.bodyRgb;
    case FishBodyPart.SCALES:
      return [0, 0, 0];
    default:
      return null;
  }
};

/**
 * Returns a random integer in the inclusive range `[min, max]`.
 *
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns Random integer.
 */
export const randomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Clamps `value` to `[min, max]`.
 *
 * @param value - The value to clamp.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns Clamped value.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Returns the query-string value for `key` from the current browser URL.
 *
 * @param key - URL parameter name.
 * @returns Parameter value string, or `undefined` if absent.
 */
export const queryStrFor = (
  key: string,
): string | string[] | null | undefined => {
  return queryString.parse(location.search)[key];
};

/**
 * Filters fish component options that are excluded for the given `appMode`.
 *
 * Each component entry may have an `exclusions` array; entries whose
 * `exclusions` include `appMode` are removed.
 *
 * @param fishComponents - Map of component-category → component-option map.
 * @param appMode - The active app mode string.
 * @returns New object with each category reduced to its allowed options.
 */
export const filterFishComponents = (
  fishComponents: Record<string, Record<string, {exclusions?: string[]}>>,
  appMode: string | null,
): Record<string, {exclusions?: string[]}[]> => {
  if (!appMode) {
    return fishComponents as Record<string, {exclusions?: string[]}[]>;
  }

  const filteredCopy: Record<string, {exclusions?: string[]}[]> = {};
  Object.keys(fishComponents).forEach(key => {
    filteredCopy[key] = Object.values(fishComponents[key]).filter(
      option => !(option.exclusions ?? []).includes(appMode),
    );
  });

  return filteredCopy;
};

/**
 * Derives the base app-mode and optional variant from the raw `appMode` string.
 *
 * For example, `"fishy-instructions"` → `["instructions", "fishy"]`.
 *
 * @param state - Current lab state.
 * @returns `[appModeBase, appModeVariant]`.
 */
export const getAppMode = (state: State): [string | null, string | null] => {
  let appModeBase: string | null = null;
  let appModeVariant: string | null = null;

  if (state.appMode) {
    appModeBase = _.last(state.appMode.toLowerCase().split('-')) ?? null;

    if (appModeBase === 'instructions') {
      appModeVariant = state.appMode.toLowerCase().split('-')[0];
    }
  }

  return [appModeBase, appModeVariant];
};

/**
 * Builds a color palette object from `colors`, selecting a random body color
 * (or using `bodyIndex` if provided) and a distinct random fin color.
 *
 * @param colors - Array of color descriptors with `rgb`, `knnData`, and `fieldInfos`.
 * @param bodyIndex - Optional fixed index for the body color.
 * @returns Palette object with `bodyRgb`, `finRgb`, `knnData`, and `fieldInfos`.
 */
export const generateColorPalette = (
  colors: Array<{rgb: number[]; knnData: number[]; fieldInfos: unknown[]}>,
  bodyIndex: number | null = null,
): {
  bodyRgb: number[];
  finRgb: number[];
  knnData: number[];
  fieldInfos: unknown[];
} => {
  const resolvedBodyIndex = bodyIndex ?? randomInt(0, colors.length - 1);

  const bodyColor = colors[resolvedBodyIndex];
  const remainingColors = colors.filter(
    (_, index) => index !== resolvedBodyIndex,
  );
  const finIndex = randomInt(0, remainingColors.length - 1);

  return {
    bodyRgb: bodyColor.rgb,
    finRgb: remainingColors[finIndex].rgb,
    knnData: [...bodyColor.knnData, ...remainingColors[finIndex].knnData],
    fieldInfos: [
      ...bodyColor.fieldInfos,
      ...remainingColors[finIndex].fieldInfos,
    ],
  };
};

/**
 * Returns elapsed run time in ms since `state.lastStartTime`, clamped to
 * `state.moveTime` if `clampTime` is true. Returns 0 when the lab is paused.
 *
 * @param state - Current lab state.
 * @param clampTime - Whether to cap the returned time at `moveTime`.
 * @returns Elapsed run time in ms.
 */
export const currentRunTime = (state: State, clampTime = false): number => {
  let t = 0;
  if (state.isRunning) {
    t = $time() - (state.lastStartTime ?? 0);
    if (clampTime && t > state.moveTime) {
      t = state.moveTime;
    }
  }

  return t;
};

/**
 * Stops fish movement by updating the running/pause state fields.
 *
 * @param t - Current timestamp used as `lastPauseTime`.
 * @param pause - Whether to mark the lab as paused (defaults to true).
 */
export const finishMovement = (t: number, pause = true): void => {
  setState({
    isRunning: false,
    isPaused: pause,
    lastPauseTime: t,
    lastStartTime: null,
  });
};

/** Clears all KNN/SVM training data and resets yes/no counts. */
const resetTraining = (state: State): void => {
  state.trainer?.clearAll();
  setState({
    yesCount: 0,
    noCount: 0,
  });
};

/**
 * Calls `onComplete` after at least `constants.minLoadingTime` has elapsed
 * since `startTime`.
 *
 * @param startTime - Timestamp when loading began.
 * @param onComplete - Callback to invoke when the minimum load time has passed.
 */
export const finishLoading = (
  startTime: number,
  onComplete: () => void,
): void => {
  const currentTime = $time();
  const minimumEndTime = startTime + constants.minLoadingTime;
  const delayTime =
    currentTime >= minimumEndTime ? 0 : minimumEndTime - currentTime;

  setTimeout(onComplete, delayTime);
};

/**
 * Fires a synthetic Google Analytics pageview for the given page name,
 * appended to the current pathname.
 *
 * @param page - Page identifier appended to `window.location.pathname`.
 */
type GaFn = (command: string, ...args: unknown[]) => void;

export const reportPageView = (page: string): void => {
  const ga = (window as Window & {ga?: GaFn}).ga;
  if (!ga || !page) {
    return;
  }

  const syntheticPagePath = window.location.pathname + '/' + page;
  ga('set', 'page', syntheticPagePath);
  ga('send', 'pageview');
};

export default {
  resetTraining,
};
