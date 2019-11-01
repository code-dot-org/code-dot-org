import queryString from 'query-string';
import {Modes} from './constants';
import {FishBodyPart} from '../utils/fishData';
import underwaterBackground from '../../public/images/underwater-background.png';
import _ from 'lodash';

export const backgroundPathForMode = mode => {
  let imgName;
  if (mode === Modes.Words || mode === Modes.Pond) {
    imgName = 'underwater';
  }

  // Temporarily show background for every mode.
  imgName = 'underwater';

  // TODO: fix this
  return imgName ? underwaterBackground : null;
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
    case FishBodyPart.MOUTH:
      // If the mouth should be tinted, return the mouth
      // color. Otherwise, return null so that it is
      // not tinted.
      return part.tinted ? palette.mouthRgb : null;
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
 * Given fishComponents and a dataSet, will filter any components that should be excluded in that dataSet.
 * Example input: {
 *   bodies: {
 *     body1: {src: 'images/body1.png'},
 *     body2: {
 *       src: 'images/body2.png',
 *       exclusions: [DataSet.Small]
 *     }
 *   }
 * }, DataSet.Small
 *
 * Example output: {
 *   bodies: [{src: 'images/body1.png'}]
 * }
 */
export const filterFishComponents = (fishComponents, dataSet) => {
  if (!dataSet) {
    return fishComponents;
  }

  let filteredCopy = {...fishComponents};
  Object.keys(filteredCopy).forEach(key => {
    filteredCopy[key] = Object.values(filteredCopy[key]).filter(
      option => !(option.exclusions || []).includes(dataSet)
    );
  });

  return filteredCopy;
};

export const getAppMode = () => {
  const appMode = _.last(queryStrFor('mode').toLowerCase().split('-'));
  let appModeVariant = null;

  // If the mode is "fishy-instrutions" then we extract "fishy" as the
  // appModeVariant.
  if (appMode === "instructions") {
    appModeVariant = queryStrFor('mode').toLowerCase().split('-')[0];
  }

  return [appMode, appModeVariant];
}
