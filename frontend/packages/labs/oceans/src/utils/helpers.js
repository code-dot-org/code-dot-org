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
