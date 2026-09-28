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

  correct: {
    color: '#73be73',
  },
  error: {
    color: '#e51f68',
  },

  largeText: {
    lineHeight: '38px',
    fontSize: 24,
    marginBottom: 20,
    borderBottom: 'solid 1px black',
    paddingBottom: 10,
  },

  regularText: {
    fontSize: 14,
  },

  smallTextRight: {
    fontSize: 12,
    textAlign: 'right',
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

  panelPopupContainer: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 'calc(100% - 40px)',
    height: 'calc(100% - 40px)',
    zIndex: 10,
  },

  panelPopup: {
    padding: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    border: 'solid 1px black',
    boxShadow: '-5px 5px 10px rgba(0, 0, 0, 0.5)',
  },

  contentsPredictBot: {
    borderRadius: 0,
    backgroundColor: colors.background,
    padding: 15,
    marginTop: 20,
  },

  rightPanel: {
    fontSize: 14,
  },

  displayTable: {
    whiteSpace: 'nowrap',
    borderSpacing: 0,
    width: '100%',
    borderCollapse: 'initial',
  },

  tableParent: {
    overflowY: 'auto',
    overflowWrap: 'break-word',
    fontSize: 10,
    boxSizing: 'border-box',
    borderRadius: 5,
    backgroundColor: 'white',
  },

  tableHeader: {
    paddingLeft: 20,
    textAlign: 'right',
    position: 'sticky',
    top: 0,
    fontSize: 12,
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'white',
  },

  tableCell: {
    paddingLeft: 20,
    textAlign: 'right',
    fontSize: 12,
  },

  resultsPanelContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  resultsStatement: {
    float: 'left',
    width: '75%',
  },

  resultsHeader: {width: '75%', float: 'left'},

  resultsHeaderAccuracy: {fontSize: 14, position: 'relative', top: 16},

  resultsAccuracy: {
    float: 'left',
    fontSize: 14,
    width: '10%',
    paddingTop: 1,
    lineHeight: 1.3,
  },

  resultsDetailsButtonContainer: {
    float: 'left',
    textAlign: 'center',
    width: '15%',
  },

  resultsDetailsButton: {
    fontSize: 14,
    padding: '8px 12px',
    margin: 0,
    border: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    backgroundColor: colors.teal,
    color: 'white',
    lineHeight: 1.3,
    position: 'relative',
    top: -7,
  },

  resultsToggle: {
    marginTop: 20,
    backgroundColor: colors.background,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    height: 42,
  },
  pill: {
    border: 'none',
    borderRadius: 5,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 20,
    backgroundColor: colors.background,
    margin: '0 0 0 20px',
    boxShadow: 'none',
    outline: 'none',
    padding: '8px 18px',
    float: 'left',
    cursor: 'pointer',
  },
  selectedPill: {
    backgroundColor: colors.teal,
    color: 'white',
    border: 'none',
  },

  resultsTableFirstHeader: {
    top: 0,
    backgroundColor: 'white',
    color: 'rgb(30, 30, 30)',
    verticalAlign: 'top',
    fontSize: 24,
    height: 31,
  },

  resultsTableSecondHeader: {
    top: '42px',
    color: 'white',
    height: 15,
  },

  resultsCellHighlight: {
    backgroundColor: colors.background,
  },

  predictBotLeft: {
    float: 'left',
    width: '20%',
  },

  predictBot: {width: '100%'},

  predictBotRight: {float: 'right', width: '75%'},

  statement: {
    lineHeight: '38px',
    fontSize: 24,
    marginBottom: 20,
    borderBottom: 'solid 1px black',
    paddingBottom: 10,
  },

  statementWithBackgroundAbsolute: {
    lineHeight: '38px',
    fontSize: 24,
    marginBottom: 20,
    paddingBottom: 10,
    position: 'absolute',
    top: 10,
    left: 10,
  },

  trainModelContainer: {
    position: 'absolute',
    overflow: 'hidden',
    paddingTop: 20,
    width: 'calc(50% + 52px)',
    height: 'calc(50% + 66px)',
    top: 0,
  },
  trainModelDataTable: {
    width: '30%',
    overflow: 'hidden',
    opacity: 1,
    paddingTop: 40,
  },
  trainModelBotContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translateX(-25%) translateY(-50%)',
  },
  trainBot: {
    position: 'relative',
    width: 300,
    margin: '0 auto',
    transformOrigin: '25%',
  },
  trainBotHead: {
    transition: 'transform 500ms',
    left: '3%',
    width: '43%',
    top: '0%',
    position: 'absolute',
    direction: 'ltr',
    transformOrigin: 'bottom right',
  },
  trainBotOpen: {
    transform: 'rotate(90deg)',
    direction: 'ltr',
  },
  trainBotBody: {
    width: '49%',
    marginTop: '30%',
    direction: 'ltr',
  },

  generateResultsContainer: {overflow: 'hidden', paddingTop: 20},
  generateResultsDataTable: {
    width: '30%',
    overflow: 'hidden',
    opacity: 1,
    paddingTop: 40,
  },
  generateResultsBotContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },

  cardRow: {
    marginTop: 11,
    marginBottom: 11,
  },

  disabledButton: {
    opacity: 0.5,
  },

  popupClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    cursor: 'pointer',
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
