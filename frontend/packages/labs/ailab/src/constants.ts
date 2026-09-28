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

const labelColor = 'rgb(254, 96, 3)';
const featureColor = 'rgb(75, 155, 213)';
const backgroundColor = '#f2f2f2';
const tealColor = 'rgb(89, 202, 211)';
const tealColorTransparent = 'rgba(89, 202, 211, 0.4)';

export const colors = {
  feature: featureColor,
  label: labelColor,
  background: backgroundColor,
  teal: tealColor,
  tealTransparent: tealColorTransparent,
};

export const styles = {
  bold: {
    fontFamily: '"Gotham 5r", sans-serif',
  },

  italic: {
    fontFamily: '"Gotham 4i", sans-serif',
  },

  regularText: {
    fontSize: 14,
  },

  panel: {
    padding: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontSize: 14,
  },

  cardRow: {
    marginTop: 11,
    marginBottom: 11,
  },

  saveInputsWidth: {
    width: '95%',
  },

  saveModelToggle: {
    cursor: 'pointer',
  },

  saveModelToggleContents: {
    marginLeft: 20,
  },

  modelCardContainer: {
    backgroundColor: 'rgb(198, 202, 205)',
    borderRadius: 5,
    padding: 20,
    whiteSpace: 'normal',
    overflowY: 'auto',
    width: '30%',
    margin: '0 auto',
  },

  modelCardHeader: {
    marginBottom: 10,
    marginTop: 0,
    fontSize: 24,
    fontFamily: '"Gotham 7r", sans-serif',
  },

  modelCardHeading: {
    fontSize: 14,
    marginTop: 0,
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: '"Gotham 7r", sans-serif',
  },

  modelCardContent: {
    fontSize: 14,
    marginBottom: 0,
    marginTop: 0,
  },

  modelCardSubpanel: {
    backgroundColor: 'rgb(231, 232, 234)',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },

  modelCardDetails: {
    marginBottom: 0,
  },

  summaryScreenBot: {
    margin: 0,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 'calc(35% - 185px)',
    width: '150px',
  },

  summaryScreenBotImage: {
    width: '100%',
  },
} as const;
