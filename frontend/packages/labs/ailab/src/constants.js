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
    color: "#73be73"
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
    border: "solid 1px black"
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
    overflow: "scroll"
  },

  dataDisplayTable: {
    whiteSpace: "nowrap"
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
  }
};
