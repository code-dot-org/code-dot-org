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
