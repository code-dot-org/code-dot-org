import {
  isPanelEnabled,
  prevNextButtons,
} from '../../src/helpers/navigationValidation';
import I18n from '../../src/i18n';

const initialState = {
  data: [],
  selectedFeatures: [],
  accuracyCheckExamples: [],
  saveStatus: 'notStarted',
  trainedModelDetails: {},
};

const dataUploadedState = {
  ...initialState,
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
  accuracyCheckExamples: [0, 0],
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
  test('dataDisplayLabel - disabled', async () => {
    const result = isPanelEnabled(initialState, 'dataDisplayLabel');
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

  test('modelSummary - disabled, save in progress', async () => {
    const result = isPanelEnabled(savingModelState, 'modelSummary');
    expect(result).toBe(false);
  });

  test('modelSummary - enabled', async () => {
    const result = isPanelEnabled(savedModelState, 'modelSummary');
    expect(result).toBe(true);
  });
});

/*
  The tree panel sits between results and saveModel, and only for a level that
  selected the decision tree. A KNN level's navigation must be unchanged.
*/
describe('prevNextButtons around the tree panel', () => {
  // prevNextButtons reads button text from I18n.
  beforeAll(() => I18n.initI18n({}));
  afterAll(() => I18n.reset());

  const trainedState = {
    ...resultsState,
    trainedModel: {predict: () => [], toJSON: () => ({})},
    historicResults: [{label: 'isEvil', features: ['house'], accuracy: '80.00'}],
    columnsByDataType: {isEvil: 'categorical', house: 'categorical'},
  };

  const onPanel = (state, currentPanel) =>
    prevNextButtons({...state, currentPanel});

  const knnState = {...trainedState, mode: {}};
  const treeState = {...trainedState, mode: {trainer: 'decisionTree'}};

  test('a KNN level goes straight from results to saveModel', () => {
    expect(onPanel(knnState, 'results').next.panel).toBe('saveModel');
  });

  test('a KNN level returns from saveModel to results', () => {
    expect(onPanel(knnState, 'saveModel').prev.panel).toBe('results');
  });

  test('a tree level goes from results to the tree panel', () => {
    expect(onPanel(treeState, 'results').next.panel).toBe('modelTree');
  });

  test('the tree panel leads on to saveModel and back to results', () => {
    const buttons = onPanel(treeState, 'modelTree');
    expect(buttons.next.panel).toBe('saveModel');
    expect(buttons.prev.panel).toBe('results');
  });

  test('a tree level returns from saveModel to the tree panel', () => {
    expect(onPanel(treeState, 'saveModel').prev.panel).toBe('modelTree');
  });

  test('an untrained tree level has no tree panel to reach', () => {
    const untrained = {...treeState, trainedModel: undefined};
    expect(onPanel(untrained, 'results').next.panel).toBe('saveModel');
  });

  describe('the accuracy gate', () => {
    const belowBar = state => ({
      ...state,
      mode: {...state.mode, requireAccuracy: 90},
    });

    test('a tree level below the bar can still read the tree', () => {
      expect(onPanel(belowBar(treeState), 'results').next.panel).toBe(
        'modelTree',
      );
    });

    test('but it cannot move on from the tree panel', () => {
      expect(onPanel(belowBar(treeState), 'modelTree').next).toBeUndefined();
    });

    test('a KNN level below the bar cannot move on from results', () => {
      expect(onPanel(belowBar(knnState), 'results').next).toBeUndefined();
    });
  });

  test('a level that hides save continues from the tree panel', () => {
    const hideSave = {
      ...treeState,
      mode: {trainer: 'decisionTree', hideSave: true},
    };
    expect(onPanel(hideSave, 'modelTree').next.panel).toBe('continue');
  });
});
