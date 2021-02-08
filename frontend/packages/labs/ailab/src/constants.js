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

export const styles = {
  app: {
    userSelect: "none"
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
    width: "70%"
  },

  bodyContainer: {
    marginTop: 20
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
    backgroundColor: "rgb(230,230,230)",
    borderRadius: 5,
    xwidth: "calc(70% - 100px)",
    border: "solid 1px black",
    overflow: "hidden"
  },

  panelContentLeft: {
    float: "left",
    width: "80%"
  },

  subPanel: {
    padding: 15,
    backgroundColor: "rgb(180,180,180)",
    borderRadius: 5,
    marginTop: 20,
    border: "solid 1px white"
  },

  scrollContents: {
    overflow: "scroll"
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
    backgroundColor: "rgb(230,230,230)",
    border: "solid 1px black",
    borderRadius: 5,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    boxSizing: "border-box",
    overflow: "scroll",
    marginTop: 59,
    position: "relative"
  },

  dataDisplayTable: {
    whiteSpace: "nowrap",
    borderSpacing: 0,
    width: "100%"
  },

  finePrint: {
    maxHeight: 300,
    overflow: "scroll",
    overflowWrap: "break-word",
    fontSize: 10,
    padding: 10,
    boxSizing: "border-box",
    borderRadius: 5,
    backgroundColor: "rgb(180,180,180)",
    border: "solid 1px white"
  },

  dataDisplayHeader: {
    paddingLeft: 20,
    textAlign: "right"
  },
  dataDisplayHeaderLabelSelected: {
    backgroundColor: "rgba(186, 168, 70)",
    color: "yellow"
  },
  dataDisplayHeaderFeatureSelected: {
    backgroundColor: "rgb(70, 186, 168)",
    color: "yellow"
  },
  dataDisplayHeaderSelected: {
    color: "yellow",
    backgroundColor: "black"
  },
  dataDisplayHeaderLabelUnselected: {
    backgroundColor: "rgba(186, 168, 70)",
    color: "white"
  },
  dataDisplayHeaderFeatureUnselected: {
    backgroundColor: "rgb(70, 186, 168)",
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
    backgroundColor: "rgba(186, 168, 70, 0.4)",
    color: "yellow"
  },
  dataDisplayCellFeatureSelected: {
    backgroundColor: "rgb(70, 186, 168)",
    color: "yellow"
  },
  dataDisplayCellSelected: {
    color: "yellow",
    backgroundColor: "grey"
  },
  dataDisplayCellLabelUnselected: {
    backgroundColor: "rgba(186, 168, 70, 0.4)"
  },
  dataDisplayCellFeatureUnselected: {
    backgroundColor: "rgb(70, 186, 168)"
  },
  dataDisplayCellUnselected: {},

  tabContainer: {
    overflow: "hidden",
    marginTop: 10
  },

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

  tab: {
    float: "left",
    backgroundColor: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "5px 30px 5px 30px",
    marginRight: 1,
    marginBottom: 2,
    cursor: "pointer",
    border: "solid 5px white",
    borderRadius: 3,
    fontFamily: '"Gotham 4r", sans-serif'
  },

  currentTab: {
    border: "solid 5px #7ad9f7",
    borderRadius: 3
  },

  disabledTab: {
    backgroundColor: "rgb(160,160,160)",
    color: "rgb(230,230,230)",
    pointerEvents: "none",
    cursor: "initial"
  },

  previousButton: {
    position: "fixed",
    left: 20,
    bottom: 60,
    fontSize: 30,
    cursor: "pointer"
  },

  nextButton: {
    position: "fixed",
    right: 20,
    bottom: 60,
    fontSize: 30,
    cursor: "pointer"
  },

  navButton: {
    backgroundColor: "black",
    color: "white",
    borderRadius: 5,
    fontSize: 24,
    border: "initial",
    padding: "10px 20px 10px 20px",
    cursor: "pointer"
  },

  predictButton: {
    backgroundColor: "rgb(186, 168, 70)"
  },
  predictBasedButton: {
    backgroundColor: "rgb(70, 186, 168)"
  },
  dontPredictButton: {
    backgroundColor: "rgb(186, 168, 70)"
  },
  dontPredictBasedButton: {
    backgroundColor: "rgb(70, 186, 168)"
  },

  statement: {
    fontSize: 36
  },

  statementLabel: {
    color: "rgb(186, 168, 70)",
    border: "dotted 1px grey",
    paddingLeft: 4,
    paddingRight: 4,
    cursor: "pointer"
  },

  statementFeature: {
    color: "rgb(70, 186, 168)",
    border: "dotted 1px grey",
    paddingLeft: 4,
    paddingRight: 4,
    cursor: "pointer"
  },

  selectLabelPopup: {
    position: "absolute",
    marginLeft: 160
  },

  selectFeaturesPopup: {
    position: "absolute",
    marginLeft: 440
  },

  popupClose: {
    position: "absolute",
    right: 20,
    cursor: "pointer"
  },

  selectLabelText: {
    color: "rgb(186, 168, 70)"
  },

  selectFeaturesText: {
    color: "rgb(70, 186, 168)"
  }
};
