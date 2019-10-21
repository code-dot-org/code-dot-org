const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200
};

export default constants;

export const Modes = Object.freeze({
  Words: 0,
  Training: 1,
  Predicting: 2,
  Pond: 3
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});
