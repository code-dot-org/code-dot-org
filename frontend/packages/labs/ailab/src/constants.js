export const ColumnTypes = {
  CATEGORICAL: "categorical",
  CONTINUOUS: "continuous",
  OTHER: "other"
};

export const MLTypes = {
  CLASSIFICATION: "classification",
  REGRESSION: "regression"
};

export const TEST_DATA_PERCENTS = [0, 5, 10, 15, 20];

export const TestDataLocations = {
  BEGINNING: "beginnning",
  END: "end",
  RANDOM: "random"
};

const labelColor = "rgb(254, 96, 3)"; // was 186
const labelColorSemi = "rgba(254, 96, 3, 0.4)";
const featureColor = "rgb(75, 155, 213)";

export const styles = {
  app: {
    userSelect: "none",
    height: "100%"
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
    fontFamily: '"Gotham 4r", sans-serif',
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
    width: "calc(30% - 20px)"
  },

  panelContainerFullWidth: {
    fontFamily: '"Gotham 4r", sans-serif',
    position: "relative",
    float: "left",
    width: "100%",
    height: "100%"
  },

  bodyContainer: {
    marginTop: 10,
    height: "100%",
    boxSizing: "border-box",
    paddingBottom: 100
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

  dataDisplayTable: {
    whiteSpace: "nowrap",
    borderSpacing: 0,
    width: "100%"
  },

  finePrint: {
    overflow: "scroll",
    overflowWrap: "break-word",
    fontSize: 10,
    padding: 10,
    boxSizing: "border-box",
    borderRadius: 5,
    backgroundColor: "white"
  },

  dataDisplayHeader: {
    paddingLeft: 20,
    textAlign: "right"
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

  dataDisplayCell: {
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

  previousButton: {
    position: "fixed",
    left: 20,
    bottom: 40,
    fontSize: 30,
    cursor: "pointer"
  },

  nextButton: {
    position: "fixed",
    right: 20,
    bottom: 40,
    fontSize: 30,
    cursor: "pointer"
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
    fontSize: 36
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
    width: "20%"
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

  regularButton: { width: "20%" }
};
