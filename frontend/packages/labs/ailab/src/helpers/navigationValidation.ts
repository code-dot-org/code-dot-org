import I18n from '../i18n';
import type {RootState} from '../redux';
import type {
  ContentPanel,
  NavButton,
  NavigationTab,
  NavigationTabId,
  Panel,
  PrevNextButtons,
} from '../types';
/*
Validation checks to determine if app set up is ready for machine learning
training. Panels prompt users to incrementally complete actions in preparation
for training. Navigation is blocked if the user has not yet completed the
action for a given panel.
*/

/*
const panelList = [
  { id: "selectDataset", label: "Import" },
  { id: "dataDisplayDataset", label: "Data" },
  { id: "dataDisplayLabel", label: "Label" },
  { id: "dataDisplayFeatures", label: "Features" },
  { id: "trainModel", label: "Train" },
  { id: "generateResults", label: "Test" },
  { id: "results", label: "Results" },
  { id: "predict", label: "Predict" },
  { id: "exportModel", label: "Export" },
  { id: "modelSummary", label: "Finish" }
];
*/

// Is a panel ready to be visited?  This determines whether a visible
// nav button is enabled or disabled.
export function isPanelEnabled(state: RootState, panelId: string): boolean {
  if (panelId !== 'selectAlgorithm' && !algorithmSelected(state)) {
    return false;
  }

  if (panelId === 'dataDisplayLabel') {
    if (!isDataUploaded(state)) {
      return false;
    }
  }

  if (panelId === 'dataDisplayDataset') {
    if (!isDataUploaded(state)) {
      return false;
    }
  }

  if (panelId === 'dataDisplayFeatures') {
    if (!labelSelected(state)) {
      return false;
    }
  }

  if (panelId === 'selectFeatures') {
    if (!minOneFeatureSelected(state)) {
      return false;
    }
  }

  if (panelId === 'trainModel') {
    if (!uniqLabelFeaturesSelected(state)) {
      return false;
    }
  }

  if (panelId === 'generateResults') {
    if (!state.trainedModel) {
      return false;
    }
  }

  if (panelId === 'results') {
    if (!resultsAvailable(state)) {
      return false;
    }
  }

  if (panelId === 'exportModel') {
    if (!resultsAvailable(state)) {
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

  if (panelId === 'selectDataset') {
    if (mode && mode.datasets && mode.datasets.length === 1) {
      return false;
    }
  }

  if (panelId === 'dataDisplayLabel') {
    if (mode && mode.hideSelectLabel) {
      return false;
    }
  }

  if (panelId === 'exportModel') {
    if ((mode && mode.hideSave) || didSaveSucceed(state)) {
      return false;
    }
  }

  return true;
}

function isDataUploaded(state: RootState): boolean {
  return state.data.length > 0 && !state.invalidData;
}

function algorithmSelected(state: RootState): boolean {
  return !!state.selectedAlgorithm;
}

function minOneFeatureSelected(state: RootState): boolean {
  return state.selectedFeatures.length !== 0;
}

function labelSelected(state: RootState): boolean {
  return !!state.labelColumn;
}

export function uniqLabelFeaturesSelected(state: RootState): boolean {
  return (
    minOneFeatureSelected(state) &&
    labelSelected(state) &&
    !state.selectedFeatures.includes(state.labelColumn!)
  );
}

function resultsAvailable(state: RootState): boolean {
  if (
    state.accuracyCheckExamples.length === 0 ||
    state.accuracyCheckPredictedLabels.length === 0
  ) {
    return false;
  }
  return !didSaveSucceed(state) || !isSaveInProgress(state);
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

const navigationTabPanels: Record<NavigationTabId, ContentPanel[]> = {
  dataset: ['selectDataset', 'dataDisplayDataset'],
  train: ['dataDisplayLabel', 'dataDisplayFeatures', 'trainModel'],
  test: ['generateResults', 'results'],
  export: ['exportModel'],
};

const navigationTabLabelKeys: Record<NavigationTabId, string> = {
  dataset: 'navigationTabDataset',
  train: 'navigationTabTrain',
  test: 'navigationTabTest',
  export: 'navigationTabExport',
};

function getActiveNavigationTab(panel: Panel): NavigationTabId | undefined {
  return (Object.keys(navigationTabPanels) as NavigationTabId[]).find(tabId =>
    navigationTabPanels[tabId].includes(panel as ContentPanel),
  );
}

export function shouldShowNavigationTabs(panel: Panel): boolean {
  return getActiveNavigationTab(panel) !== undefined;
}

function firstAvailablePanel(
  state: RootState,
  panels: ContentPanel[],
): ContentPanel | undefined {
  return panels.find(panel => isPanelAvailable(state, panel));
}

function getNavigationTabPanel(
  state: RootState,
  tabId: NavigationTabId,
): ContentPanel | undefined {
  if (tabId === 'dataset') {
    return isDataUploaded(state)
      ? 'dataDisplayDataset'
      : firstAvailablePanel(state, navigationTabPanels.dataset);
  }

  if (tabId === 'train') {
    if (state.currentPanel === 'trainModel') {
      return 'trainModel';
    }
    if (labelSelected(state) && isPanelAvailable(state, 'dataDisplayFeatures')) {
      return 'dataDisplayFeatures';
    }
  }

  if (tabId === 'test') {
    return resultsAvailable(state) && state.currentPanel !== 'trainModel'
      ? 'results'
      : 'generateResults';
  }

  return firstAvailablePanel(state, navigationTabPanels[tabId]);
}

export function getNavigationTabs(state: RootState): NavigationTab[] {
  const activeTab = getActiveNavigationTab(state.currentPanel);

  return (Object.keys(navigationTabPanels) as NavigationTabId[]).map(tabId => {
    const panel = getNavigationTabPanel(state, tabId);
    const selected = tabId === activeTab;

    return {
      id: tabId,
      text: I18n.t(navigationTabLabelKeys[tabId]),
      panel,
      enabled: !!panel && (selected || isPanelEnabled(state, panel)),
      selected,
    };
  });
}

function isModelNamed(state: RootState): boolean {
  return ![undefined, ''].includes(state.trainedModelDetails.name);
}

function isAccuracyAcceptable(state: RootState): boolean {
  const mode = state.mode;

  if (
    mode &&
    mode.requireAccuracy &&
    mode.requireAccuracy > Number(state.historicResults[0].accuracy)
  ) {
    return false;
  }

  return true;
}

// Given the current panel, return the appropriate previous & next buttons.
export function prevNextButtons(state: RootState): PrevNextButtons {
  let prev: NavButton | undefined, next: NavButton | undefined;

  if (state.currentPanel === 'selectAlgorithm') {
    prev = undefined;
    const panel = firstAvailablePanel(state, navigationTabPanels.dataset);
    next = panel ? {panel, text: I18n.t('navigateForward')} : undefined;
  } else if (state.currentPanel === 'selectDataset') {
    prev = {panel: 'selectAlgorithm', text: I18n.t('navigateBack')};
    next = isPanelAvailable(state, 'dataDisplayDataset')
      ? {panel: 'dataDisplayDataset', text: I18n.t('navigateForward')}
      : undefined;
  } else if (state.currentPanel === 'dataDisplayDataset') {
    prev = isPanelAvailable(state, 'selectDataset')
      ? {panel: 'selectDataset', text: I18n.t('navigateBack')}
      : {panel: 'selectAlgorithm', text: I18n.t('navigateBack')};
    next = isPanelAvailable(state, 'dataDisplayLabel')
      ? {panel: 'dataDisplayLabel', text: I18n.t('navigateForward')}
      : isPanelAvailable(state, 'dataDisplayFeatures')
        ? {panel: 'dataDisplayFeatures', text: I18n.t('navigateForward')}
        : undefined;
  } else if (state.currentPanel === 'dataDisplayLabel') {
    prev = {panel: 'dataDisplayDataset', text: I18n.t('navigateBack')};
    next = isPanelAvailable(state, 'dataDisplayFeatures')
      ? {panel: 'dataDisplayFeatures', text: I18n.t('navigateForward')}
      : undefined;
  } else if (state.currentPanel === 'dataDisplayFeatures') {
    prev = isPanelAvailable(state, 'dataDisplayLabel')
      ? {panel: 'dataDisplayLabel', text: I18n.t('navigateBack')}
      : {panel: 'dataDisplayDataset', text: I18n.t('navigateBack')};
    next = isPanelAvailable(state, 'trainModel')
      ? {panel: 'trainModel', text: I18n.t('navigateForward')}
      : undefined;
  } else if (state.currentPanel === 'trainModel') {
    if (state.trainedModel) {
      prev = undefined;
      next = {panel: 'generateResults', text: I18n.t('navigateForward')};
    }
  } else if (state.currentPanel === 'generateResults') {
    if (state.trainedModel) {
      prev = undefined;
      next = {panel: 'results', text: I18n.t('navigateForward')};
    }
  } else if (state.currentPanel === 'results') {
    prev = isPanelAvailable(state, 'dataDisplayFeatures')
      ? {panel: 'dataDisplayFeatures', text: I18n.t('tryAgain')}
      : undefined;
    next = !isAccuracyAcceptable(state)
      ? undefined
      : isPanelAvailable(state, 'exportModel')
        ? {panel: 'exportModel', text: I18n.t('navigateForward')}
        : {panel: 'continue', text: I18n.t('navigateDone')};
  } else if (state.currentPanel === 'exportModel') {
    prev = {panel: 'results', text: I18n.t('navigateBack')};
    next = isPanelAvailable(state, 'modelSummary')
      ? {panel: 'modelSummary', text: I18n.t('exportProgress')}
      : undefined;
  } else if (state.currentPanel === 'modelSummary') {
    prev = isPanelAvailable(state, 'exportModel')
      ? {panel: 'exportModel', text: I18n.t('navigateBack')}
      : undefined;
    next = isPanelAvailable(state, 'finish')
      ? {panel: 'finish', text: I18n.t('navigateDone')}
      : undefined;
  }

  if (prev) {
    prev.enabled = isPanelEnabled(state, prev.panel);
  }
  if (next) {
    next.enabled = isPanelEnabled(state, next.panel);
  }

  return {prev, next};
}
