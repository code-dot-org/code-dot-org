const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200
};

export default constants;

export const Modes = Object.freeze({
  Loading: 0,
  ActivityIntro: 1,
  Words: 2,
  TrainingIntro: 3,
  Training: 4,
  Predicting: 5,
  Pond: 6
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});
