export const backgroundPathForMode = mode => {
  let backgroundImageName;

  // TODO: Replace with actual background images.
  // if (mode === Modes.Training) {
  //   backgroundImageName = 'classroom';
  // } else if (mode === Modes.Predicting) {
  //   backgroundImageName = 'pipes';
  // } else if (mode === Modes.Pond) {
  //   backgroundImageName = 'underwater';
  // }

  backgroundImageName = 'underwater';
  return backgroundPath(backgroundImageName);
};

export const backgroundPath = imgName => {
  return `images/${imgName}-background.png`;
};

// TODO: (maddie) ADD DESCRIPTION
export const createButton = button => {
  let btnEl = document.createElement('button');
  btnEl.innerHTML = button.text;
  btnEl.setAttribute('id', button.id);
  btnEl.setAttribute('class', 'ui-button');
  btnEl.addEventListener('click', button.onClick);

  return btnEl;
};
