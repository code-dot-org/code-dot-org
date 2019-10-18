export const backgroundPathForMode = mode => {
  let imgName;
  if (mode === Modes.Training || mode === Modes.Pond) {
    imgName = 'underwater';
  }

  return imgName ? backgroundPath(imgName) : null;
};

export const backgroundPath = imgName => {
  return `images/${imgName}-background.png`;
};

// Creates a button element, given a button object that contains
// id, text, and onClick properties.
export const createButton = button => {
  let btnEl = document.createElement('button');
  btnEl.innerHTML = button.text;
  btnEl.setAttribute('id', button.id);
  btnEl.setAttribute('class', 'ui-button');
  btnEl.addEventListener('click', button.onClick);

  return btnEl;
};
