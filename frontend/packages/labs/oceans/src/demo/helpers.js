import queryString from 'query-string';
import {FishBodyPart} from '../utils/fishData';
import _ from 'lodash';
// import {Modes} from './constants';
// import underwaterBackground from '../../public/images/underwater-background.png';

export const backgroundPathForMode = mode => {
  // Temporarily disable background everywhere.
  return null;

  // TODO: fix this
  // let imgName;
  // if (mode === Modes.Words || mode === Modes.Pond) {
  //   imgName = 'underwater';
  // }
  // return imgName ? underwaterBackground : null;
};

export const backgroundPath = imgName => {
  return `images/${imgName}-background.png`;
};

export const bodyAnchorFromType = (body, type) => {
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
    case FishBodyPart.BODY:
      return body.anchor;
    default:
      return [0, 0];
  }
};

export const colorForFishPart = (palette, part) => {
  switch (part.type) {
    case FishBodyPart.DORSAL_FIN:
    case FishBodyPart.PECTORAL_FIN_FRONT:
    case FishBodyPart.PECTORAL_FIN_BACK:
    case FishBodyPart.TAIL:
      return palette.finRgb;
    case FishBodyPart.BODY:
      return palette.bodyRgb;
    default:
      return null;
  }
};

export const randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Given a key, returns the value from the browser's current query params.
export const queryStrFor = key => {
  return queryString.parse(location.search)[key];
};

/**
 * Given fishComponents and an AppMode, will filter any components that should be excluded in that AppMode.
 * Example input: {
 *   bodies: {
 *     body1: {src: 'images/body1.png'},
 *     body2: {
 *       src: 'images/body2.png',
 *       exclusions: [AppMode.FishShort]
 *     }
 *   }
 * }, AppMode.FishShort
 *
 * Example output: {
 *   bodies: [{src: 'images/body1.png'}]
 * }
 */
export const filterFishComponents = (fishComponents, appMode) => {
  if (!appMode) {
    return fishComponents;
  }

  let filteredCopy = {...fishComponents};
  Object.keys(filteredCopy).forEach(key => {
    filteredCopy[key] = Object.values(filteredCopy[key]).filter(
      option => !(option.exclusions || []).includes(appMode)
    );
  });

  return filteredCopy;
};

// Get the base appMode (e.g. "instructions") & optional variant (e.g. "fishy")
// from the appMode string (e.g. "fishy-instructions") stored in the provided state.
export const getAppMode = state => {
  let appModeBase = null;
  let appModeVariant = null;

  if (state.appMode) {
    appModeBase = _.last(state.appMode.toLowerCase().split('-'));

    // If the mode is "fishy-instructions" then we extract "fishy" as the
    // appModeVariant.
    if (appModeBase === 'instructions') {
      appModeVariant = state.appMode.toLowerCase().split('-')[0];
    }
  }

  return [appModeBase, appModeVariant];
};

// Given an array of colors and an optional bodyIndex, returns an object
// that represents a color palette.
export const generateColorPalette = (colors, bodyIndex = null) => {
  if (!bodyIndex) {
    bodyIndex = randomInt(0, colors.length - 1);
  }

  const bodyColor = colors[bodyIndex];
  colors = colors.filter((_, index) => index !== bodyIndex);
  const finIndex = randomInt(0, colors.length - 1);

  return {
    bodyRgb: bodyColor.rgb,
    finRgb: colors[finIndex].rgb,
    knnData: bodyColor.knnData
  };
};
