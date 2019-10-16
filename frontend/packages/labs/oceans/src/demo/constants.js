const constants = {
  canvasWidth: 1024,
  canvasHeight: 576
};

export default constants;

export const Modes = Object.freeze({
  Training: 0,
  Predicting: 1,
  Pond: 2
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});

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
