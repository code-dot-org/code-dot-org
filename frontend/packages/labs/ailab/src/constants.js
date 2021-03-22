export const ColumnTypes = {
  CATEGORICAL: "categorical",
  NUMERICAL: "numerical"
};

export const MLTypes = {
  CLASSIFICATION: "classification",
  REGRESSION: "regression"
};

export const ResultsGrades = {
  CORRECT: "correct",
  INCORRECT: "incorrect"
};

export const TEST_DATA_PERCENTS = [0, 5, 10, 15, 20];

export const TestDataLocations = {
  BEGINNING: "beginning",
  END: "end",
  RANDOM: "random"
};

export const ModelNameMaxLength = 150;

export const saveMessages = {
  success: "Your model was saved!",
  failure: "There was an error. Your model did not save.",
  name: "Please name your model."
};

const labelColor = "rgb(254, 96, 3)"; // was 186
const labelColorSemi = "rgba(254, 96, 3, 0.4)";
const featureColor = "rgb(75, 155, 213)";

export const colors = {
  feature: "rgb(70, 186, 168)",
  label: "rgb(186, 168, 70)"
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
    fontSize: 18,
    marginBottom: 8
  },

  smallText: {
    fontSize: 12,
    marginBottom: 8
  },

  panel: {
    padding: 20,
    backgroundColor: "white", // rgb(230,230,230)",
    borderRadius: 5,
    overflow: "hidden",
    height: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  },

  popupPanel: {
    position: "absolute",
    border: "1px solid",
    top: 90,
    height: "initial",
    zIndex: 1
  },

  scrollableContents: {
    overflow: "hidden"
  },

  scrollableContentsTinted: {
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "rgb(206, 206, 206)"
  },

  scrollingContents: {
    padding: 15,
    overflow: "scroll",
    height: "100%",
    boxSizing: "border-box"
  },

  contents: {
    borderRadius: 5,
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
    backgroundColor: "white", // rgb(230,230,230)",
    //border: "solid 1px black",
    borderRadius: 5,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    boxSizing: "border-box",
    overflow: "scroll",
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
    borderRadius: 10,
    height: 240
  },

  selectDatasetItemSelected: {
    border: "solid 4px white"
  },

  selectDatasetImage: {
    width: "100%"
  },

  specifyColumnsItem: {
    display: "inline-block",
    width: "20%"
  },

  displayTable: {
    whiteSpace: "nowrap",
    borderSpacing: 0,
    width: "100%"
  },

  tableParent: {
    overflowY: "scroll",
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
    top: 0
  },

  dataDisplayHeaderLabelSelected: {
    backgroundColor: labelColor,
    color: "yellow"
  },
  dataDisplayHeaderFeatureSelected: {
    backgroundColor: featureColor,
    color: "yellow"
  },
  dataDisplayHeaderSelected: {
    color: "yellow",
    backgroundColor: "black"
  },
  dataDisplayHeaderLabelUnselected: {
    backgroundColor: labelColor,
    color: "white"
  },
  dataDisplayHeaderFeatureUnselected: {
    backgroundColor: featureColor,
    color: "white"
  },
  dataDisplayHeaderUnselected: {
    backgroundColor: "black",
    color: "white"
  },
  dataDisplayHeaderHighlighted: {
    backgroundColor: "#64fff16b",
    color: "white"
  },
  tableCell: {
    paddingLeft: 20,
    textAlign: "right"
  },
  dataDisplayCellLabelSelected: {
    backgroundColor: labelColorSemi,
    color: "yellow"
  },
  dataDisplayCellFeatureSelected: {
    backgroundColor: featureColor,
    color: "yellow"
  },
  dataDisplayCellSelected: {
    color: "yellow",
    backgroundColor: "grey"
  },
  dataDisplayCellLabelUnselected: {
    backgroundColor: labelColorSemi
  },
  dataDisplayCellFeatureUnselected: {
    backgroundColor: featureColor
  },
  dataDisplayCellUnselected: {},

  dataDisplayCellHighlighted: { backgroundColor: "#64fff16b" },

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

  resultsTableFirstHeader: {
    top: 0,
    backgroundColor: "white",
    color: "rgb(30, 30, 30)"
  },

  resultsTableSecondHeader: {
    top: "30px"
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
    fontSize: 36,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 5
  },

  statementLabel: {
    color: labelColor,
    paddingLeft: 4,
    paddingRight: 4
  },

  statementFeature: {
    color: featureColor,
    paddingLeft: 4,
    paddingRight: 4
  },

  selectLabelText: {
    color: labelColor
  },

  selectFeaturesText: {
    color: featureColor
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

  cardRow: {
    marginTop: 5,
    marginBottom: 5
  },

  regularButton: { width: "20%" },

  floatLeft: {
    float: "left",
    margin: 20
  },

  phraseBuilder: {
    fontSize: 24
  },

  phraseBuilderHeader: {
    backgroundColor: "grey",
    color: "white",
    padding: 15
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
    fontSize: 24,
    marginTop: 10,
    padding: 6,
    cursor: "pointer",
    height: 43,
    width: "100%"
  },

  phraseBuilderSelectReadonly: {
    fontSize: 24,
    marginTop: 10,
    padding: 6,
  },

  phraseBuilderFeature: { padding: 10, paddingBottom: 0, position: "relative" },

  saveInputsWidth: {
    width: "95%"
  }
};
