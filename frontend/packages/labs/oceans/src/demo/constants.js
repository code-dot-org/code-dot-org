const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200
};

export default constants;

export const AppMode = Object.freeze({
  FishVTrash: 'fishvtrash',
  CreaturesVTrashDemo: 'creaturesvtrashdemo',
  CreaturesVTrash: 'creaturesvtrash',
  FishShort: 'short',
  FishLong: 'long'
});

export const Modes = Object.freeze({
  Loading: 0,
  Words: 1,
  Training: 2,
  Predicting: 3,
  Pond: 4,
  Instructions: 5
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
