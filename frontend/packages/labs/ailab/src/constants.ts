export const ColumnTypes = {
  CATEGORICAL: 'categorical',
  NUMERICAL: 'numerical',
};

export const MLTypes = {
  CLASSIFICATION: 'classification',
  REGRESSION: 'regression',
};

export const RegressionTrainer = 'knnRegress';
export const ClassificationTrainer = 'knnClassify';
export const TreeRegressionTrainer = 'treeRegress';
export const TreeClassificationTrainer = 'treeClassify';

export const REGRESSION_ERROR_TOLERANCE = 5;

export const ResultsGrades = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  ALL: 'all',
};

export const PERCENT_OF_DATASET_FOR_TESTING = 0.1;

export const TestDataLocations = {
  END: 'end',
  RANDOM: 'random',
};

export const ModelNameMaxLength = 150;

export const UNIQUE_OPTIONS_MAX = 50;

export function getFadeOpacity(animationProgress: number): number {
  return animationProgress > 0.95
    ? 1 - (animationProgress - 0.95) / 0.05
    : animationProgress < 0.05
      ? animationProgress / 0.05
      : 1;
}

export const colors = {
  feature: 'rgb(75, 155, 213)',
  label: 'rgb(254, 96, 3)',
  background: '#f2f2f2',
  teal: 'rgb(89, 202, 211)',
  tealTransparent: 'rgba(89, 202, 211, 0.4)',
};
