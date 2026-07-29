import {Algorithms} from '../../src/constants';
import {
  getNavigationTabs,
  isPanelEnabled,
  shouldShowNavigationTabs,
} from '../../src/helpers/navigationValidation';
import I18n from '../../src/i18n';

const initialState = {
  data: [],
  selectedFeatures: [],
  accuracyCheckExamples: [],
  accuracyCheckPredictedLabels: [],
  saveStatus: 'notStarted',
  trainedModelDetails: {},
};

const algorithmSelectedState = {
  ...initialState,
  selectedAlgorithm: Algorithms.KNN,
};

const dataUploadedState = {
  ...algorithmSelectedState,
  data: [
    {
      name: 'Hermione',
      isEvil: false,
      house: 'Gryffindor',
    },
    {
      name: 'Harry',
      isEvil: false,
      house: 'Gryffindor',
    },
    {
      name: 'Voldemort',
      isEvil: true,
      house: 'Slytherin',
    },
  ],
};

const selectedLabelState = {
  ...dataUploadedState,
  labelColumn: 'isEvil',
};

const selectedFeaturesState = {
  ...selectedLabelState,
  selectedFeatures: ['house'],
};

/*
  Given the constraints of the UI, this is not a state we expect users to ever
  be in, but it's important that the model training step happen only when
  features and label are unique.
*/
const sameFeatureLabelState = {
  ...dataUploadedState,
  labelColumn: 'isEvil',
  selectedFeatures: ['isEvil'],
};

const resultsState = {
  ...selectedFeaturesState,
  trainedModel: {},
  accuracyCheckExamples: [0, 0],
  accuracyCheckPredictedLabels: [0, 0],
};

const savingModelState = {
  ...resultsState,
  trainedModelDetails: {
    name: 'Which Hogwarts House is Evil?',
  },
  saveStatus: 'started',
};

const savedModelState = {
  ...savingModelState,
  saveStatus: 'success',
};

describe('isPanelEnabled', () => {
  test('selectAlgorithm - enabled', async () => {
    const result = isPanelEnabled(initialState, 'selectAlgorithm');
    expect(result).toBe(true);
  });

  test('selectDataset - disabled until an algorithm is selected', async () => {
    const result = isPanelEnabled(initialState, 'selectDataset');
    expect(result).toBe(false);
  });

  test('selectDataset - enabled after an algorithm is selected', async () => {
    const result = isPanelEnabled(algorithmSelectedState, 'selectDataset');
    expect(result).toBe(true);
  });

  test('dataDisplayLabel - disabled', async () => {
    const result = isPanelEnabled(algorithmSelectedState, 'dataDisplayLabel');
    expect(result).toBe(false);
  });

  test('dataDisplayLabel - enabled', async () => {
    const result = isPanelEnabled(dataUploadedState, 'dataDisplayLabel');
    expect(result).toBe(true);
  });

  test('dataDisplayFeatures - disabled', async () => {
    const result = isPanelEnabled(dataUploadedState, 'dataDisplayFeatures');
    expect(result).toBe(false);
  });

  test('dataDisplayFeatures - enabled', async () => {
    const result = isPanelEnabled(selectedLabelState, 'dataDisplayFeatures');
    expect(result).toBe(true);
  });

  test('selectFeatures - disabled', async () => {
    const result = isPanelEnabled(selectedLabelState, 'selectFeatures');
    expect(result).toBe(false);
  });

  test('selectFeatures - enabled', async () => {
    const result = isPanelEnabled(selectedFeaturesState, 'selectFeatures');
    expect(result).toBe(true);
  });

  test('trainModel - disabled', async () => {
    const result = isPanelEnabled(sameFeatureLabelState, 'trainModel');
    expect(result).toBe(false);
  });

  test('trainModel - enabled', async () => {
    const result = isPanelEnabled(selectedFeaturesState, 'trainModel');
    expect(result).toBe(true);
  });

  test('generateResults - disabled', async () => {
    const result = isPanelEnabled(selectedFeaturesState, 'generateResults');
    expect(result).toBe(false);
  });

  test('generateResults - enabled', async () => {
    const result = isPanelEnabled(resultsState, 'generateResults');
    expect(result).toBe(true);
  });

  test('results - disabled', async () => {
    const result = isPanelEnabled(selectedFeaturesState, 'results');
    expect(result).toBe(false);
  });

  test('results - enabled', async () => {
    const result = isPanelEnabled(resultsState, 'results');
    expect(result).toBe(true);
  });

  test('modelSummary - disabled, no model name', async () => {
    const result = isPanelEnabled(resultsState, 'modelSummary');
    expect(result).toBe(false);
  });

  test('exportModel - disabled until results are available', async () => {
    const result = isPanelEnabled(selectedFeaturesState, 'exportModel');
    expect(result).toBe(false);
  });

  test('exportModel - enabled after results are available', async () => {
    const result = isPanelEnabled(resultsState, 'exportModel');
    expect(result).toBe(true);
  });

  test('modelSummary - disabled, save in progress', async () => {
    const result = isPanelEnabled(savingModelState, 'modelSummary');
    expect(result).toBe(false);
  });

  test('modelSummary - enabled', async () => {
    const result = isPanelEnabled(savedModelState, 'modelSummary');
    expect(result).toBe(true);
  });
});

describe('getNavigationTabs', () => {
  beforeEach(() => {
    I18n.initI18n();
  });

  test('starts with the dataset tab disabled before an algorithm is selected', () => {
    const tabs = getNavigationTabs({
      ...initialState,
      currentPanel: 'selectAlgorithm',
    });

    expect(tabs).toEqual([
      {
        id: 'dataset',
        text: 'Dataset',
        panel: 'selectDataset',
        enabled: false,
        selected: false,
      },
      {
        id: 'train',
        text: 'Train',
        panel: 'trainModel',
        enabled: false,
        selected: false,
      },
      {
        id: 'test',
        text: 'Test',
        panel: 'generateResults',
        enabled: false,
        selected: false,
      },
      {
        id: 'export',
        text: 'Export',
        panel: 'exportModel',
        enabled: false,
        selected: false,
      },
    ]);
  });

  test('enables Dataset after an algorithm is selected', () => {
    const tabs = getNavigationTabs({
      ...algorithmSelectedState,
      currentPanel: 'selectAlgorithm',
    });

    expect(tabs.find(tab => tab.id === 'dataset')).toMatchObject({
      panel: 'selectDataset',
      enabled: true,
      selected: false,
    });
  });

  test('enables Train after label and features are selected', () => {
    const tabs = getNavigationTabs({
      ...selectedFeaturesState,
      currentPanel: 'dataDisplayFeatures',
    });

    expect(tabs.find(tab => tab.id === 'dataset')).toMatchObject({
      selected: true,
    });
    expect(tabs.find(tab => tab.id === 'train')).toMatchObject({
      panel: 'trainModel',
      enabled: true,
      selected: false,
    });
    expect(tabs.find(tab => tab.id === 'test')).toMatchObject({
      enabled: false,
    });
    expect(tabs.find(tab => tab.id === 'export')).toMatchObject({
      enabled: false,
    });
  });

  test('opens Test to the generation animation from Train', () => {
    const tabs = getNavigationTabs({
      ...resultsState,
      currentPanel: 'trainModel',
    });

    expect(tabs.find(tab => tab.id === 'train')).toMatchObject({
      enabled: true,
      selected: true,
    });
    expect(tabs.find(tab => tab.id === 'test')).toMatchObject({
      panel: 'generateResults',
      enabled: true,
    });
  });

  test('opens Test to results after the animation step', () => {
    const tabs = getNavigationTabs({
      ...resultsState,
      currentPanel: 'results',
    });

    expect(tabs.find(tab => tab.id === 'test')).toMatchObject({
      panel: 'results',
      enabled: true,
      selected: true,
    });
    expect(tabs.find(tab => tab.id === 'export')).toMatchObject({
      panel: 'exportModel',
      enabled: true,
    });
  });

  test('selects Export after testing is complete', () => {
    const tabs = getNavigationTabs({
      ...resultsState,
      currentPanel: 'exportModel',
    });

    expect(tabs.find(tab => tab.id === 'export')).toMatchObject({
      panel: 'exportModel',
      enabled: true,
      selected: true,
    });
  });

  test('uses the feature-selection panel when dataset and label panels are hidden', () => {
    const tabs = getNavigationTabs({
      ...selectedLabelState,
      currentPanel: 'dataDisplayFeatures',
      mode: {
        datasets: ['shapes_v1_toy'],
        hideSelectLabel: true,
      },
    });

    expect(tabs.find(tab => tab.id === 'dataset')).toMatchObject({
      panel: 'dataDisplayFeatures',
      enabled: true,
      selected: true,
    });
  });
});

describe('shouldShowNavigationTabs', () => {
  test('shows tabs for data, train, test, and export panels', () => {
    expect(shouldShowNavigationTabs('selectAlgorithm')).toBe(false);
    expect(shouldShowNavigationTabs('selectDataset')).toBe(true);
    expect(shouldShowNavigationTabs('trainModel')).toBe(true);
    expect(shouldShowNavigationTabs('results')).toBe(true);
    expect(shouldShowNavigationTabs('exportModel')).toBe(true);
  });

  test('hides tabs outside the data/train/test/export flow', () => {
    expect(shouldShowNavigationTabs('modelSummary')).toBe(false);
  });
});
