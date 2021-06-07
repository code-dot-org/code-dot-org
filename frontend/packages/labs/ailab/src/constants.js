export const ColumnTypes = {
  CATEGORICAL: "categorical",
  NUMERICAL: "numerical"
};

export const MLTypes = {
  CLASSIFICATION: "classification",
  REGRESSION: "regression"
};

export const RegressionTrainer = "knnRegress";
export const ClassificationTrainer = "knnClassify";

export const REGRESSION_ERROR_TOLERANCE = 5;

export const ResultsGrades = {
  CORRECT: "correct",
  INCORRECT: "incorrect"
};

export const PERCENT_OF_DATASET_FOR_TESTING = 0.1;

export const TestDataLocations = {
  END: "end",
  RANDOM: "random"
};

export const ModelNameMaxLength = 150;

export const UNIQUE_OPTIONS_MAX = 50;

export const saveMessages = {
  success: "Your model was saved!",
  failure: "There was an error. Your model did not save. Please try again."
};

export function getFadeOpacity(animationProgress) {
  return animationProgress > 0.95
    ? 1 - (animationProgress - 0.95) / 0.05
    : animationProgress < 0.05
    ? animationProgress / 0.05
    : 1;
}

const labelColor = "rgb(254, 96, 3)";
const featureColor = "rgb(75, 155, 213)";
const backgroundColor = "#f2f2f2";
const tealColor = "rgb(89, 202, 211)";
const tealColorTransparent = "rgba(89, 202, 211, 0.4)";

export const colors = {
  feature: featureColor,
  label: labelColor,
  background: backgroundColor,
  teal: tealColor,
  tealTransparent: tealColorTransparent
};

export const styles = {
  app: {
    userSelect: "none",
    height: "100%",
    fontFamily: '"Gotham 4r", sans-serif'
  },

  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  },

  italic: {
    fontFamily: '"Gotham 4i", sans-serif'
  },

  correct: {
    color: "#73be73"
  },
  error: {
    color: "#e51f68"
  },
  ready: {
    color: "#73be73",
    backgroundColor: "white"
  },

  panelContainer: {
    position: "relative",
    float: "left",
    width: "70%",
    height: "100%"
  },

  panelContainerLeft: {
    width: "70%"
  },

  panelContainerRight: {
    marginLeft: 10,
    width: "calc(30% - 10px)"
  },

  panelContainerFullWidth: {
    fontFamily: '"Gotham 4r", sans-serif',
    position: "relative",
    float: "left",
    width: "100%",
    height: "100%"
  },

  bodyContainer: {
    height: "100%",
    boxSizing: "border-box",
    paddingBottom: 50
  },

  largeText: {
    lineHeight: "38px",
    fontSize: 24,
    marginBottom: 20,
    borderBottom: "solid 1px black",
    paddingBottom: 10
  },

  mediumText: {
    fontSize: 14,
    marginBottom: 8
  },

  regularText: {
    fontSize: 14
  },

  smallText: {
    fontSize: 12,
    marginBottom: 8
  },

  smallTextRight: {
    fontSize: 12,
    textAlign: "right"
  },

  footerText: {
    fontSize: 13,
    marginTop: 12
  },

  panel: {
    padding: 10,
    backgroundColor: "white",
    overflow: "hidden",
    height: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    fontSize: 14
  },

  panelPopupContainer: {
    position: "absolute",
    left: 20,
    top: 20,
    width: "calc(100% - 40px)",
    height: "calc(100% - 40px)",
    zIndex: 10
  },

  panelPopup: {
    padding: 10,
    backgroundColor: "white",
    overflow: "hidden",
    height: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    border: "solid 1px black",
    boxShadow: "-5px 5px 10px rgba(0, 0, 0, 0.5)"
  },

  scrollableContents: {
    overflow: "hidden",
    position: "relative"
  },

  scrollingContents: {
    overflow: "auto",
    height: "100%",
    boxSizing: "border-box",
    overflowWrap: "break-word"
  },

  contents: {
    borderRadius: 0,
    backgroundColor: colors.background,
    padding: 15
  },

  contentsCsvButton: {
    borderRadius: 0,
    backgroundColor: colors.background,
    padding: 15,
    marginTop: 20,
    paddingTop: 25,
    paddingBottom: 25
  },

  contentsPredictBot: {
    borderRadius: 0,
    backgroundColor: colors.background,
    padding: 15,
    marginTop: 20
  },

  panelContentLeft: {
    float: "left",
    width: "80%"
  },

  validationMessages: {
    position: "fixed",
    bottom: 80,
    right: 20,
    width: "calc(30% - 20px)",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 5
  },

  validationMessagesLight: {
    float: "left",
    marginLeft: 10,
    width: "calc(30% - 20px)",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 5,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    boxSizing: "border-box",
    overflow: "auto",
    marginTop: 59,
    position: "relative"
  },

  rightPanel: {
    fontSize: 14
  },

  selectDatasetItem: {
    width: "calc(33.33% - 4px)",
    padding: 10,
    float: "left",
    boxSizing: "border-box",
    border: "solid 4px #f2f2f2",
    borderRadius: 0,
    cursor: "pointer",
    backgroundColor: "white",
    margin: 2,
    position: "relative"
  },

  selectDatasetItemHighlighted: {
    border: "solid 4px rgba(85, 217, 255, 0.6)"
  },

  selectDatasetItemSelected: {
    border: "solid 4px rgb(85, 217, 255)"
  },

  selectDatasetItemContainer: {
    width: "100%",
    // This assumes that all dataset images have a 1.5 aspect ratio, e.g. 720x480.
    paddingTop: "calc(100% / 1.5)"
  },

  selectDatasetImage: {
    display: "block",
    width: "calc(100% - 20px)",
    position: "absolute",
    top: 10
  },

  selectDatasetText: {
    fontSize: 14,
    marginTop: 5,
    marginRight: 20,
    position: "absolute",
    bottom: 23,
    left: 20,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: "3px 5px",
    borderRadius: 3
  },

  uploadCsvButton: {
    fontSize: 14,
    margin: 0,
    border: "none",
    cursor: "pointer",
    borderRadius: 5,
    backgroundColor: colors.teal,
    color: "white",
    padding: "10px 20px",
    display: "inline-block"
  },

  csvInput: {
    display: "none",
    cursor: "pointer"
  },

  specifyColumnsItem: {
    display: "inline-block",
    width: "20%"
  },

  displayTable: {
    whiteSpace: "nowrap",
    borderSpacing: 0,
    width: "100%",
    borderCollapse: "initial"
  },

  tableParent: {
    overflowY: "auto",
    overflowWrap: "break-word",
    fontSize: 10,
    boxSizing: "border-box",
    borderRadius: 5,
    backgroundColor: "white"
  },

  tableHeader: {
    paddingLeft: 20,
    textAlign: "right",
    position: "sticky",
    top: 0,
    fontSize: 12
  },

  dataDisplayHeader: {
    paddingLeft: 20,
    textAlign: "right",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    color: "#4d575f",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white",
    padding: 7,
    fontSize: 14
  },

  dataDisplayHeaderClickable: {
    cursor: "pointer"
  },

  dataDisplayHeaderLabelHidden: {
    opacity: 0
  },

  dataDisplayHeaderLabel: {
    backgroundColor: labelColor,
    color: "white"
  },
  dataDisplayHeaderFeature: {
    backgroundColor: featureColor,
    color: "white"
  },

  dataDisplayCellHidden: {
    opacity: 0
  },

  dataDisplayCell: {
    padding: 3,
    paddingLeft: 20,
    textAlign: "right",
    fontSize: 12,
    color: "#4d575f",
    backgroundColor: colors.background,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white"
  },
  dataDisplayCellHighlighted: {
    backgroundColor: "#d6f2fa",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d6f2fa",
    cursor: "pointer"
  },
  dataDisplayCellHighlightedLabel: {
    backgroundColor: "#f1caca",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f1caca",
    cursor: "pointer"
  },
  dataDisplayCellSelected: {
    backgroundColor: "#94e3fa",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#94e3fa"
  },
  dataDisplayCellSelectedLabel: {
    backgroundColor: "#f39f9f",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f39f9f"
  },

  tableCell: {
    paddingLeft: 20,
    textAlign: "right",
    fontSize: 12
  },

  dataDisplayCellLabelSelected: {},
  dataDisplayCellFeatureSelected: {},

  dataDisplayCellLabelUnselected: {},
  dataDisplayCellFeatureUnselected: {},
  dataDisplayCellUnselected: {},

  barChart: {
    marginTop: 10,
    marginBottom: 10
  },

  scatterPlot: {
    marginTop: 10,
    marginBottom: 10
  },

  crossTabTable: {
    marginTop: 10,
    marginBottom: 20
  },

  crosssTabHeader: {
    backgroundColor: "initial",
    color: "initial",
    border: "initial",
    fontSize: 14,
    padding: "initial"
  },

  crossTabLeftColumn: {
    fontSize: 14,
    writingMode: "vertical-rl",
    whiteSpace: "nowrap",
    transform: "scale(-1)"
  },

  crossTabTableCell: {
    paddingLeft: 20,
    textAlign: "right",
    fontSize: 12,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white"
  },

  crossTabCell0: {
    backgroundColor: "rgba(89, 202, 211, 0)"
  },
  crossTabCell1: {
    backgroundColor: "rgba(89, 202, 211, 0.2)"
  },
  crossTabCell2: {
    backgroundColor: "rgba(89, 202, 211, 0.4)"
  },
  crossTabCell3: {
    backgroundColor: "rgba(89, 202, 211, 0.6)"
  },
  crossTabCell4: {
    backgroundColor: "rgba(89, 202, 211, 0.8)"
  },
  crossTabCell5: {
    backgroundColor: "rgba(89, 202, 211, 1)"
  },

  resultsPanelContainer: {
    width: "100%",
    height: "100%",
    position: "relative"
  },

  resultsStatement: {
    float: "left",
    width: "75%"
  },

  resultsAccuracy: {
    float: "left",
    fontSize: 14,
    width: "10%",
    paddingTop: 1,
    lineHeight: 1.3
  },

  resultsDetailsButtonContainer: {
    float: "left",
    textAlign: "center",
    width: "15%"
  },

  resultsDetailsButton: {
    fontSize: 14,
    padding: "8px 12px",
    margin: 0,
    border: "none",
    cursor: "pointer",
    borderRadius: 5,
    backgroundColor: colors.teal,
    color: "white",
    lineHeight: 1.3,
    position: "relative",
    top: -7
  },

  resultsToggle: {
    marginTop: 20,
    backgroundColor: colors.background,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "white",
    padding: 10,
    height: 42
  },
  pill: {
    border: "none",
    borderRadius: 5,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 20,
    backgroundColor: colors.background,
    margin: "0 0 0 20px",
    boxShadow: "none",
    outline: "none",
    padding: "8px 18px",
    float: "left",
    cursor: "pointer"
  },
  selectedPill: {
    backgroundColor: colors.teal,
    color: "white",
    border: "none"
  },

  resultsPreviousHeading: { clear: "both", paddingTop: 18, paddingBottom: 6 },

  resultsTableFirstHeader: {
    top: 0,
    backgroundColor: "white",
    color: "rgb(30, 30, 30)",
    verticalAlign: "top",
    fontSize: 24
  },

  resultsTableSecondHeader: {
    top: "42px",
    color: "white"
  },

  resultsCellHighlight: {
    backgroundColor: colors.background
  },

  predictBotLeft: {
    float: "left",
    width: "20%"
  },

  predictBot: { width: "100%" },

  predictBotRight: { float: "right", width: "75%" },

  previousButton: {
    position: "fixed",
    left: 20,
    bottom: 40,
    fontSize: 30,
    cursor: "pointer",
    zIndex: 1001
  },

  nextButton: {
    position: "fixed",
    right: 20,
    bottom: 40,
    fontSize: 30,
    cursor: "pointer",
    zIndex: 1001
  },

  navButton: {
    backgroundColor: "rgb(254, 190, 64)",
    color: "white",
    borderRadius: 5,
    fontSize: 24,
    border: "initial",
    padding: "10px 20px 10px 20px",
    cursor: "pointer"
  },

  statement: {
    lineHeight: "38px",
    fontSize: 24,
    marginBottom: 20,
    borderBottom: "solid 1px black",
    paddingBottom: 10
  },

  statementWithBackground: {
    lineHeight: "38px",
    fontSize: 24,
    marginBottom: 20,
    paddingBottom: 10
  },

  statementSmall: {
    fontSize: 14,
    paddingBottom: 6
  },

  statementLabel: {
    backgroundColor: labelColor,
    color: "white",
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 1,
    paddingBottom: 1,
    display: "inline-block",
    position: "relative",
    lineHeight: 1.3
  },

  statementFeature: {
    backgroundColor: featureColor,
    color: "white",
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 1,
    paddingBottom: 1,
    display: "inline-block",
    position: "relative",
    lineHeight: 1.3
  },

  statementDeleteIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    transform: "translateX(50%) translateY(-50%)",
    color: "black",
    cursor: "pointer"
  },

  statementDeleteCircle: {
    backgroundColor: "white",
    borderRadius: "50%",
    height: 20,
    width: 20,
    top: 0,
    left: 0
  },

  statementDeleteX: {
    fontSize: 20,
    position: "absolute",
    top: 0,
    right: 0,
    lineHeight: "20px"
  },

  selectLabelText: {
    color: labelColor
  },

  selectFeaturesText: {
    color: featureColor
  },

  selectLabelButton: {
    backgroundColor: labelColor,
    color: "white",
    padding: 10,
    cursor: "pointer",
    border: "none",
    fontSize: 14,
    marginTop: 10
  },

  selectFeaturesButton: {
    backgroundColor: featureColor,
    color: "white",
    padding: 10,
    cursor: "pointer",
    border: "none",
    fontSize: 14,
    marginTop: 10
  },

  trainModelContainer: {
    position: "absolute",
    overflow: "hidden",
    paddingTop: 20,
    width: "calc(50% + 52px)",
    height: "calc(50% + 66px)",
    top: 0
  },
  trainModelDataTable: {
    width: "30%",
    overflow: "hidden",
    opacity: 1,
    paddingTop: 20
  },
  trainModelBotContainer: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translateX(-25%) translateY(-50%)"
  },
  trainBot: {
    position: "relative",
    width: 300,
    margin: "0 auto",
    transformOrigin: "25%"
  },
  trainBotHead: {
    transition: "transform 500ms",
    left: "3%",
    width: "43%",
    top: "0%",
    position: "absolute",
    direction: "ltr",
    transformOrigin: "bottom right"
  },
  trainBotOpen: {
    transform: "rotate(90deg)",
    direction: "ltr"
  },
  trainBotBody: {
    width: "49%",
    marginTop: "30%",
    direction: "ltr"
  },

  generateResultsContainer: { overflow: "hidden", paddingTop: 20 },
  generateResultsDataTable: {
    width: "30%",
    overflow: "hidden",
    opacity: 1,
    paddingTop: 20
  },
  generateResultsBotContainer: {
    position: "absolute",
    left: "50%",
    top: "50%"
  },

  generateResultsBotBody: {
    width: "49%",
    direction: "ltr"
  },

  cardRow: {
    marginTop: 11,
    marginBottom: 11
  },

  disabledButton: {
    opacity: 0.5
  },

  floatLeft: {
    float: "left",
    margin: 20
  },

  phraseBuilder: {
    fontSize: 16
  },

  phraseBuilderHeader: {
    backgroundColor: "grey",
    color: "white",
    padding: 15
  },

  phraseBuilderHeaderSecond: {
    backgroundColor: "grey",
    color: "white",
    padding: 15,
    marginTop: 30
  },

  popupClose: {
    position: "absolute",
    top: 10,
    right: 10,
    cursor: "pointer"
  },

  phraseBuilderFeatureRemove: {
    position: "absolute",
    top: 10,
    right: 10,
    cursor: "pointer",
    fontSize: 12
  },

  phraseBuilderSelect: {
    fontSize: 16,
    marginTop: 10,
    padding: 6,
    cursor: "pointer",
    height: 43,
    width: "100%"
  },

  phraseBuilderLabel: {
    fontSize: 16,
    marginTop: 10,
    paddingTop: 13,
    paddingLeft: 13,
    height: 43,
    backgroundColor: labelColor,
    color: "white",
    boxSizing: "border-box"
  },

  phraseBuilderFeature: {
    fontSize: 16,
    marginTop: 10,
    paddingTop: 13,
    paddingLeft: 13,
    height: 43,
    backgroundColor: featureColor,
    color: "white",
    boxSizing: "border-box",
    position: "relative"
  },

  resultsBot: {
    position: "relative",
    width: "100%"
  },

  saveInputsWidth: {
    width: "95%"
  },

  saveModelToggle: {
    cursor: "pointer"
  },

  saveModelToggleContents: {
    marginLeft: 20
  },

  modelCardContainer: {
    backgroundColor: "rgb(198, 202, 205)",
    borderRadius: 5,
    padding: 20,
    whiteSpace: "normal",
    overflowY: "auto",
    width: "30%",
    margin: "0 auto"
  },

  modelCardHeader: {
    marginBottom: 10,
    marginTop: 0,
    fontSize: 24,
    fontFamily: '"Gotham 7r", sans-serif'
  },

  modelCardHeading: {
    fontSize: 14,
    marginTop: 0,
    marginBottom: 5,
    textAlign: "center",
    fontFamily: '"Gotham 7r", sans-serif'
  },

  modelCardContent: {
    fontSize: 14,
    marginBottom: 0,
    marginTop: 0
  },

  modelCardSubpanel: {
    backgroundColor: "rgb(231, 232, 234)",
    borderRadius: 5,
    marginBottom: 10,
    padding: 10
  },

  modelCardDetails: {
    marginBottom: 0
  },

  summaryScreenBot: {
    margin: 0,
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: "calc(35% - 185px)",
    width: "150px"
  },

  summaryScreenBotImage: {
    width: "100%"
  },

  modelSaveMessage: {
    bottom: 40,
    zIndex: 1001,
    right: "calc(50% - 250px)",
    textAlign: "center",
    position: "fixed",
    width: 500,
    height: 30,
    lineHeight: "20px"
  }
};
