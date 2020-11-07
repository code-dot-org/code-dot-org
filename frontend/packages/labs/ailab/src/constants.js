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
  error: {
    color: '#e51f68'
  },
  ready: {
    color: '#73be73'
  },

  container: {
    fontFamily: '"Gotham 4r", sans-serif',
    position: 'relative'
  },

  largeText: {
    fontSize: 24,
    marginBottom: 10,
  },

  mediumText: {
    fontSize: 18,
    marginBottom: 8
  },

  panel: {
    padding: 20,
    backgroundColor: 'rgb(230,230,230)',
    borderRadius: 5,
    width: 'calc(70% - 100px)',
    marginTop: 20,
    border: 'solid 1px black'
  },

  subPanel: {
    padding: 15,
    backgroundColor: 'rgb(180,180,180)',
    borderRadius: 5,
    marginTop: 20,
    border: 'solid 1px white'
  },

  validationMessages: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 'calc(30% - 20px)',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 5
  },

  finePrint: {
    maxHeight: 300,
    overflow: 'scroll',
    overflowWrap: 'break-word',
    fontSize: 10,
    padding: 10,
    boxSizing: 'border-box',
    borderRadius: 5,
    backgroundColor: 'rgb(180,180,180)',
    border: 'solid 1px white'
  }
};
