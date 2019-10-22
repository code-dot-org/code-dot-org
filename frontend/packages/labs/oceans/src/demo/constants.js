const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200
};

export default constants;

export const Modes = Object.freeze({
  Loading: 0,
  Training: 2,
  Predicting: 3,
  Pond: 4
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});
