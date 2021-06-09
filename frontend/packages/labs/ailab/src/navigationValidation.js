/*
Validation checks to determine if app set up is ready for machine learning
training. Panels prompt users to incrementally complete actions in preparation
for training. Navigation is blocked if the user has not yet completed the
action for a given panel.
*/

/*
const panelList = [
  { id: "selectDataset", label: "Import" },
  { id: "dataDisplayLabel", label: "Label" },
  { id: "dataDisplayFeatures", label: "Features" },
  { id: "trainModel", label: "Train" },
  { id: "generateResults", label: "Test" },
  { id: "results", label: "Results" },
  { id: "predict", label: "Predict" },
  { id: "saveModel", label: "Save" },
  { id: "modelSummary", label: "Finish" }
];
*/

// Is a panel ready to be visited?  This determines whether a visible
// nav button is enabled or disabled.
export function isPanelEnabled(state, panelId) {

  if (panelId === "dataDisplayLabel") {
    if (!isDataUploaded(state)) {
      return false;
    }
  }

  if (panelId === "dataDisplayFeatures") {
    if (!labelSelected(state)) {
      return false;
    }
  }

  if (panelId === "selectFeatures") {
    if (!minOneFeatureSelected(state)) {
      return false;
    }
  }

  if (panelId === "trainModel") {
    if (!readyToTrain(state)) {
      return false;
    }
  }

  if (panelId === "results") {
    if (!readyForResults(state)) {
      return false;
    }
  }

  if (panelId === "modelSummary") {
    if (isSaveInProgress(state)) {
      return false;
    }

    if (!isModelNamed(state)) {
      return false;
    }
  }

  return true;
}


// Is a panel available to be shown?  This determines what panels
// can possibly be visited in the app.
function isPanelAvailable(state, panelId) {
  const mode = state.mode;

  if (panelId === "selectDataset") {
    if (mode && mode.datasets && mode.datasets.length === 1) {
      return false;
    }
  }

  if (panelId === "dataDisplayLabel") {
    if (mode && mode.hideSelectLabel) {
      return false;
    }
  }

  if (panelId === "saveModel") {
    if ((mode && mode.hideSave) || didSaveSucceed(state)) {
      return false;
    }
  }

  return true;
}

function isDataUploaded(state) {
  return state.data.length > 0;
}

function readyToTrain(state) {
  return uniqLabelFeaturesSelected(state);
}

function minOneFeatureSelected(state) {
  return state.selectedFeatures.length !== 0;
}

function labelSelected(state) {
  return !!state.labelColumn;
}

function uniqLabelFeaturesSelected(state) {
  return (
    minOneFeatureSelected(state) &&
    labelSelected(state) &&
    !state.selectedFeatures.includes(state.labelColumn)
  );
}

function readyForResults(state) {
  return state.accuracyCheckExamples.length === 0 ||
  didSaveSucceed(state) || isSaveInProgress(state);
}

function isSaveInProgress(state) {
  return state.saveStatus === "started";
}

function didSaveSucceed(state) {
  return state.saveStatus === "success";
}

export function isSaveComplete(saveStatus) {
  return ["success", "failure"].includes(saveStatus);
}

export function shouldDisplaySaveStatus(saveStatus) {
  return ["success", "failure", "started"].includes(saveStatus);
}

function isModelNamed(state) {
  return ![undefined, ""].includes(state.trainedModelDetails.name);
}
