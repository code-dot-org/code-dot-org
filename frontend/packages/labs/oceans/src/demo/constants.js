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
  Pond: 6,
  Instructions: 7
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});

// Describes the current data set and whether it is restricted
// (e.g., if DataSet.Small === true, we will restrict which words
// or fish the student sees).
export const DataSet = Object.freeze({
  Small: 'small'
});
