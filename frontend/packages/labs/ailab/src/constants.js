export const ColumnTypes = {
  CATEGORICAL: "categorical",
  CONTINUOUS: "continuous",
  OTHER: "other"
};

export const MLTypes = {
  CLASSIFICATION: "classification",
  REGRESSION: "regression"
};

export const TRAINING_DATA_PERCENTS = [0, 5, 10, 15, 20];

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
    padding: 10,
    backgroundColor: "rgb(230,230,230)",
    border: "solid 1px black",
    borderRadius: 5,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    boxSizing: "border-box",
    overflow: "scroll",
    marginTop: 59
  },

  dataDisplayTable: {
    whiteSpace: "nowrap",
    borderSpacing: 0
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
    display: "inline-block",
    width: 120,
    backgroundColor: "black",
    color: "white",
    textAlign: "right"
  },

  dataDisplayHeaderCurrent: {
    display: "inline-block",
    width: 120,
    backgroundColor: "black",
    color: "yellow",
    textAlign: "right"
  },

  dataDisplayHeaderLabel: {
    display: "inline-block",
    width: 120,
    backgroundColor: "rgb(186, 168, 70)",
    color: "white",
    textAlign: "right"
  },

  dataDisplayHeaderSelectedFeature: {
    display: "inline-block",
    width: 120,
    backgroundColor: "rgb(70, 186, 168)",
    color: "white",
    textAlign: "right"
  },

  dataDisplayCellLabel: {
    display: "inline-block",
    backgroundColor: "rgba(186, 168, 70, 0.4)",
    width: 120,
    textAlign: "right"
  },

  dataDisplayCellSelectedFeature: {
    display: "inline-block",
    backgroundColor: "rgba(70, 186, 168, 0.4)",
    width: 120,
    textAlign: "right"
  },

  dataDisplayCellCurrent: {
    display: "inline-block",
    width: 120,
    textAlign: "right",
    color: "yellow",
    backgroundColor: "grey"
  },

  dataDisplayCell: {
    display: "inline-block",
    width: 120,
    textAlign: "right"
  },

  tabContainer: {
    overflow: "hidden",
    marginTop: 10
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
    bottom: 20,
    fontSize: 30,
    cursor: "pointer"
  },

  nextButton: {
    position: "fixed",
    right: 20,
    bottom: 20,
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
  dontPredictBasedButton: {
    backgroundColor: "rgb(70, 186, 168)"
  },

  statement: {
    fontSize: 36
  },

  statementLabel: {
    color: "rgb(186, 168, 70)"
  },

  statementFeature: {
    color: "rgb(70, 186, 168)"
  },

  selectLabelPopup: {
    position: "absolute",
    marginLeft: 160
  },

  selectFeaturesPopup: {
    position: "absolute",
    marginLeft: 440
  },

  selectFeaturesPopupClose: {
    position: "absolute",
    right: 20
  },

  selectLabelText: {
    color: "rgb(186, 168, 70)"
  },

  selectFeaturesText: {
    color: "rgb(70, 186, 168)"
  }

};
