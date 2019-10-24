import {setState} from './state';
import {init as initScene} from './init';
import {Modes, ClassType} from './constants';
import {FishBodyPart} from '../utils/fishData';

export const backgroundPathForMode = mode => {
  let imgName;
  if (mode === Modes.Words || mode === Modes.Pond) {
    imgName = 'underwater';
  }

  return imgName ? backgroundPath(imgName) : null;
};

export const backgroundPath = imgName => {
  return `images/${imgName}-background.png`;
};

export const toMode = mode => {
  setState({currentMode: mode});
  initScene();
};

// Creates a button element, given an object that contains
// id, text, and onClick properties.
export const createButton = ({
  id,
  text,
  onClick,
  className = 'ui-button',
  show = true
}) => {
  let btnEl = document.createElement('button');
  btnEl.innerHTML = text;
  if (id) {
    btnEl.setAttribute('id', id);
  }
  btnEl.setAttribute('class', className);
  btnEl.addEventListener('click', onClick);
  if (!show) {
    btnEl.style.display = 'none';
  }
  return btnEl;
};

// Creates a div element with text, given an object that contains
// id and text properties.
export const createText = ({id, text}) => {
  let textEl = document.createElement('div');
  textEl.setAttribute('id', id);
  textEl.innerHTML = text;

  return textEl;
};

export const strForClassType = classType => {
  switch (classType) {
    case ClassType.Like:
      return 'like';
    case ClassType.Dislike:
      return 'dislike';
    default:
      return 'unknown';
  }
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
