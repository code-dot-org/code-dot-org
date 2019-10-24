const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200
};

export default constants;

export const Modes = Object.freeze({
  Loading: 0,
  Words: 1,
  TrainingIntro: 2,
  Training: 3,
  Predicting: 4,
  Pond: 5
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});
