import {Modes, ClassType} from './constants';

export const backgroundPathForMode = mode => {
  let imgName;
  if (mode === Modes.Words || mode === Modes.Training || mode === Modes.Pond) {
    imgName = 'underwater';
  }

  return imgName ? backgroundPath(imgName) : null;
};

export const backgroundPath = imgName => {
  return `images/${imgName}-background.png`;
};

// Creates a button element, given an object that contains
// id, text, and onClick properties.
export const createButton = ({id, text, onClick}) => {
  let btnEl = document.createElement('button');
  btnEl.innerHTML = text;
  btnEl.setAttribute('id', id);
  btnEl.setAttribute('class', 'ui-button');
  btnEl.addEventListener('click', onClick);

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
