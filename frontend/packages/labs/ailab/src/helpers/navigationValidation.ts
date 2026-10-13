import I18n from '../i18n';
import type {RootState} from '../redux';
import type {AilabProject, NavButton, PrevNextButtons} from '../types';

import {areArraysEqual} from './utils';
/*
Validation checks to determine if app set up is ready for machine learning
training. Panels prompt users to incrementally complete actions in preparation
for training. Navigation is blocked if the user has not yet completed the
action for a given panel.
*/

/*
const panelList = [
  { id: "selectDataset", label: "Import" },
  { id: "datasetView", label: "Dataset" },
  { id: "results", label: "Results" },
  { id: "predict", label: "Predict" },
  { id: "saveModel", label: "Save" },
  { id: "modelSummary", label: "Finish" }
];
*/

// Is a panel ready to be visited?  This determines whether a visible
// nav button is enabled or disabled.
export function isPanelEnabled(
  state: RootState,
  project: AilabProject,
  panelId: string,
): boolean {
  if (panelId === 'datasetView') {
    if (!isDataUploaded(state)) {
      return false;
    }
  }

  if (panelId === 'selectFeatures') {
    if (project.selectedFeatures.length === 0) {
      return false;
    }
  }

  if (panelId === 'results') {
    if (!resultsAvailable(state, project)) {
      return false;
    }
  }

  if (panelId === 'modelSummary') {
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
function isPanelAvailable(state: RootState, panelId: string): boolean {
  const mode = state.mode;

  // Hidden for now; the dataset picker will come back later.
  if (panelId === 'selectDataset') {
    return false;
  }

  if (panelId === 'saveModel') {
    if ((mode && mode.hideSave) || didSaveSucceed(state)) {
      return false;
    }
  }

  return true;
}

function isDataUploaded(state: RootState): boolean {
  return state.data.length > 0 && !state.invalidData;
}

export function uniqLabelFeaturesSelected(project: AilabProject): boolean {
  const {labelColumn, selectedFeatures} = project;
  return (
    selectedFeatures.length !== 0 &&
    !!labelColumn &&
    !selectedFeatures.includes(labelColumn)
  );
}

function isTrainedOnCurrentColumns(project: AilabProject): boolean {
  const latestResult = project.historicResults[0];
  return (
    !!latestResult &&
    latestResult.label === project.labelColumn &&
    areArraysEqual(latestResult.features, project.selectedFeatures)
  );
}

export function hasCurrentTrainingResult(project: AilabProject): boolean {
  return (
    isTrainedOnCurrentColumns(project) && project.historicResults[0].total > 0
  );
}

function resultsAvailable(state: RootState, project: AilabProject): boolean {
  return (
    state.accuracyCheckExamples.length > 0 && isTrainedOnCurrentColumns(project)
  );
}

function isSaveInProgress(state: RootState): boolean {
  return state.saveStatus === 'started';
}

function didSaveSucceed(state: RootState): boolean {
  return state.saveStatus === 'success';
}

export function isSaveComplete(saveStatus: string): boolean {
  return ['success', 'failure', 'piiProfanity'].includes(saveStatus);
}

export function shouldDisplaySaveStatus(saveStatus: string): boolean {
  return ['success', 'failure', 'started', 'piiProfanity'].includes(saveStatus);
}

function isModelNamed(state: RootState): boolean {
  return ![undefined, ''].includes(state.trainedModelDetails.name);
}

// Given the current panel, return the appropriate previous & next buttons.
export function prevNextButtons(
  state: RootState,
  project: AilabProject,
): PrevNextButtons {
  let prev: NavButton | undefined, next: NavButton | undefined;

  if (state.currentPanel === 'selectDataset') {
    prev = undefined;
    next = {panel: 'datasetView', text: I18n.t('navigateForward')};
  } else if (state.currentPanel === 'datasetView') {
    // The Train panel's own button moves on to training.
    prev = isPanelAvailable(state, 'selectDataset')
      ? {panel: 'selectDataset', text: I18n.t('navigateBack')}
      : undefined;
    next = undefined;
  } else if (state.currentPanel === 'saveModel') {
    prev = {panel: 'results', text: I18n.t('navigateBack')};
    next = isPanelAvailable(state, 'modelSummary')
      ? {panel: 'modelSummary', text: I18n.t('saveProgress')}
      : undefined;
  } else if (state.currentPanel === 'modelSummary') {
    prev = isPanelAvailable(state, 'saveModel')
      ? {panel: 'saveModel', text: I18n.t('navigateBack')}
      : undefined;
    next = isPanelAvailable(state, 'finish')
      ? {panel: 'finish', text: I18n.t('navigateDone')}
      : undefined;
  }

  if (prev) {
    prev.enabled = isPanelEnabled(state, project, prev.panel);
  }
  if (next) {
    next.enabled = isPanelEnabled(state, project, next.panel);
  }

  return {prev, next};
}
