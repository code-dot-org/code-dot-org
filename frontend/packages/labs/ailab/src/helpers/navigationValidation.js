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
    if (!uniqLabelFeaturesSelected(state)) {
      return false;
    }
  }

  if (panelId === "results") {
    if (!resultsAvailable(state)) {
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
  return state.data.length > 0 && !state.invalidData;
}

function minOneFeatureSelected(state) {
  return state.selectedFeatures.length !== 0;
}

function labelSelected(state) {
  return !!state.labelColumn;
}

export function uniqLabelFeaturesSelected(state) {
  return (
    minOneFeatureSelected(state) &&
    labelSelected(state) &&
    !state.selectedFeatures.includes(state.labelColumn)
  );
}

function resultsAvailable(state) {
  if (state.accuracyCheckExamples.length === 0) {
    return false;
  }
  return !didSaveSucceed(state) || !isSaveInProgress(state);
}

function isSaveInProgress(state) {
  return state.saveStatus === "started";
}

function didSaveSucceed(state) {
  return state.saveStatus === "success";
}

export function isSaveComplete(saveStatus) {
  return ["success", "failure", "piiProfanity"].includes(saveStatus);
}

export function shouldDisplaySaveStatus(saveStatus) {
  return ["success", "failure", "started", "piiProfanity"].includes(saveStatus);
}

function isModelNamed(state) {
  return ![undefined, ""].includes(state.trainedModelDetails.name);
}

function isAccuracyAcceptable(state) {
  const mode = state.mode;

  if (
    mode &&
    mode.requireAccuracy &&
    mode.requireAccuracy > state.historicResults[0].accuracy
  ) {
    return false;
  }

  return true;
}

// Given the current panel, return the appropriate previous & next buttons.
export function prevNextButtons(state) {
  let prev, next;

  if (state.currentPanel === "selectDataset") {
    prev = null;
    next = isPanelAvailable(state, "dataDisplayLabel")
      ? { panel: "dataDisplayLabel", text: "Continue" }
      : isPanelAvailable(state, "dataDisplayFeatures")
      ? { panel: "dataDisplayFeatures", text: "Continue" }
      : null;
  } else if (state.currentPanel === "dataDisplayLabel") {
    prev = isPanelAvailable(state, "selectDataset")
      ? { panel: "selectDataset", text: "Back" }
      : null;
    next = isPanelAvailable(state, "dataDisplayFeatures")
      ? { panel: "dataDisplayFeatures", text: "Continue" }
      : null;
  } else if (state.currentPanel === "dataDisplayFeatures") {
    prev = isPanelAvailable(state, "dataDisplayLabel")
      ? { panel: "dataDisplayLabel", text: "Back" }
      : null;
    next = isPanelAvailable(state, "trainModel")
      ? { panel: "trainModel", text: "Train" }
      : null;
  } else if (state.currentPanel === "trainModel") {
    if (state.trainedModel) {
      prev = null;
      next = { panel: "generateResults", text: "Continue" };
    }
  } else if (state.currentPanel === "generateResults") {
    if (state.trainedModel) {
      prev = null;
      next = { panel: "results", text: "Continue" };
    }
  } else if (state.currentPanel === "results") {
    prev = isPanelAvailable(state, "dataDisplayFeatures")
      ? { panel: "dataDisplayFeatures", text: "Try again" }
      : null;
    next = !isAccuracyAcceptable(state)
      ? null
      : isPanelAvailable(state, "saveModel")
      ? { panel: "saveModel", text: "Continue" }
      : { panel: "continue", text: "Finish" };
  } else if (state.currentPanel === "saveModel") {
    prev = { panel: "results", text: "Back" };
    next = isPanelAvailable(state, "modelSummary")
      ? { panel: "modelSummary", text: "Save" }
      : null;
  } else if (state.currentPanel === "modelSummary") {
    prev = isPanelAvailable(state, "saveModel")
      ? { panel: "saveModel", text: "Back" }
      : null;
    next = isPanelAvailable(state, "finish")
      ? { panel: "finish", text: "Finish" }
      : null;
  }

  if (prev) {
    prev.enabled = isPanelEnabled(state, prev.panel);
  }
  if (next) {
    next.enabled = isPanelEnabled(state, next.panel);
  }

  return { prev, next };
}
