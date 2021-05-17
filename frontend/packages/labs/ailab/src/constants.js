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

export const TEST_DATA_PERCENTS = [0, 5, 10, 15, 20];

export const TestDataLocations = {
  END: "end",
  RANDOM: "random"
};

export const ModelNameMaxLength = 150;

export const saveMessages = {
  success: "Your model was saved!",
  failure: "There was an error. Your model did not save. Please try again.",
};

const labelColor = "rgb(254, 96, 3)";
const featureColor = "rgb(75, 155, 213)";

export const colors = {
  feature: featureColor,
  label: labelColor
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
    fontSize: 24,
    marginBottom: 10
  },

  mediumText: {
    fontSize: 13,
    marginBottom: 8
  },

  smallText: {
    fontSize: 12,
    marginBottom: 8
  },

  smallTextNoMargin: {
    fontSize: 12
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
    position: "relative"
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
    //opacity: 0.7,
    border: "solid 1px black",
    boxShadow: "-5px 5px 10px black"
  },

  scrollableContents: {
    overflow: "hidden"
  },

  scrollableContentsTinted: {
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: "rgb(206, 206, 206)",
    padding: 10
  },

  scrollingContents: {
    overflow: "auto",
    height: "100%",
    boxSizing: "border-box"
  },

  contents: {
    borderRadius: 0,
    backgroundColor: "rgb(206, 206, 206)",
    padding: 15
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
    fontSize: 13
  },

  selectDatasetItem: {
    width: "30%",
    padding: 20,
    float: "left",
    boxSizing: "border-box",
    border: "solid 4px rgba(0,0,0,0)",
    borderRadius: 0,
    height: 220,
    cursor: "pointer"
  },

  selectDatasetItemHighlighted: {
    backgroundColor: "#d6f2fa"
  },

  selectDatasetItemSelected: {
    backgroundColor: "#94e3fa"
  },

  selectDatasetImage: {
    width: "100%"
  },

  selectDatasetText: {
    fontSize: 14,
    marginTop: 10
  },

  uploadButton: {
    fontSize: 13.33,
    padding: "2px 6px",
    margin: 0,
    border: "none"
  },

  specifyColumnsItem: {
    display: "inline-block",
    width: "20%"
  },

  displayTable: {
    whiteSpace: "nowrap",
    borderSpacing: 0,
    width: "100%",
    borderCollapse: "collapse"
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
    backgroundColor: "#f2f2f2",
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

  crossTabCell0: {
    backgroundColor: "rgba(255,100,100, 0)"
  },
  crossTabCell1: {
    backgroundColor: "rgba(255,100,100, 0.2)"
  },
  crossTabCell2: {
    backgroundColor: "rgba(255,100,100, 0.4)"
  },
  crossTabCell3: {
    backgroundColor: "rgba(255,100,100, 0.6)"
  },
  crossTabCell4: {
    backgroundColor: "rgba(255,100,100, 0.8)"
  },
  crossTabCell5: {
    backgroundColor: "rgba(255,100,100, 1)"
  },

  resultsPanelContainer: {
    width: "100%",
    height: "100%",
    position: "relative"
  },

  resultsStatement: {
    float: "left",
    width: "80%"
  },

  resultsAccuracy: { float: "left", fontSize: 18, width: "10%" },

  resultsDetailsButtonContainer: {
    float: "left",
    textAlign: "center",
    width: "10%"
  },

  resultsDetailsButton: {
    fontSize: 14,
    padding: "4px 12px",
    margin: 0,
    border: "none",
    cursor: "pointer",
    borderRadius: 5,
    backgroundColor: "#61d2eb",
    color: "white"
  },

  resultsPreviousHeading: { clear: "both", paddingTop: 18, paddingBottom: 6 },

  resultsTableFirstHeader: {
    top: 0,
    backgroundColor: "white",
    color: "rgb(30, 30, 30)",
    verticalAlign: "top",
    height: 45
  },

  resultsTableSecondHeader: {
    top: "47px",
    color: "white"
  },

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
    fontSize: 32,
    paddingBottom: 15,
    lineHeight: '50px'
  },

  statementSmall: {
    fontSize: 18,
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
    transform: 'translateX(50%) translateY(-50%)',
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
    fontSize: 18
  },

  selectFeaturesButton: {
    backgroundColor: featureColor,
    color: "white",
    padding: 10,
    cursor: "pointer",
    border: "none",
    fontSize: 18
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
    transform: "translateX(-25%)"
  },
  trainBot: {
    position: "relative",
    width: 300
  },
  trainBotHead: {
    transition: "transform 500ms",
    left: "3%",
    width: "43%",
    top: "0%",
    position: "absolute",
    direction: "ltr"
  },
  trainBotOpen: {
    transform: "rotate(90deg)",
    transformOrigin: "bottom right",
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
    transform: "translateX(-25%)"
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

  saveInputsWidth: {
    width: "95%"
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
    fontSize: 18,
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
    fontSize: 13,
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
