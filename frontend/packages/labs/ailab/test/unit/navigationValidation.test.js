import {
  isPanelEnabled,
  isTrainedOnCurrentColumns,
  prevNextButtons,
  uniqLabelFeaturesSelected,
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
  test('datasetView - disabled', async () => {
    const result = isPanelEnabled(initialState, 'datasetView');
    expect(result).toBe(false);
  });

  test('datasetView - enabled', async () => {
    const result = isPanelEnabled(dataUploadedState, 'datasetView');
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

describe('uniqLabelFeaturesSelected', () => {
  test('false when a feature is also the label', () => {
    expect(uniqLabelFeaturesSelected(sameFeatureLabelState)).toBe(false);
  });

  test('true when the label and features differ', () => {
    expect(uniqLabelFeaturesSelected(selectedFeaturesState)).toBe(true);
  });
});

describe('isTrainedOnCurrentColumns', () => {
  const trainedState = {
    ...resultsState,
    selectedFeatures: ['house', 'name'],
    historicResults: [
      {label: 'isEvil', features: ['house', 'name'], accuracy: '100'},
    ],
  };

  test('false before any training', () => {
    expect(
      isTrainedOnCurrentColumns({...resultsState, historicResults: []}),
    ).toBe(false);
  });

  test('true when the columns match the latest training', () => {
    expect(isTrainedOnCurrentColumns(trainedState)).toBe(true);
  });

  test.each([
    ['label', {labelColumn: 'name', selectedFeatures: ['house']}],
    ['features', {selectedFeatures: ['house']}],
    ['feature order', {selectedFeatures: ['name', 'house']}],
  ])('false when the %s changed since training', (_, changes) => {
    expect(isTrainedOnCurrentColumns({...trainedState, ...changes})).toBe(
      false,
    );
  });
});

describe('prevNextButtons on the data panels', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('datasetView goes back to dataset selection and has no next button', () => {
    const {prev, next} = prevNextButtons({
      ...selectedFeaturesState,
      currentPanel: 'datasetView',
    });
    expect(prev.panel).toBe('selectDataset');
    expect(next).toBeUndefined();
  });

  test('has no back button when the mode fixes the dataset', () => {
    const {prev} = prevNextButtons({
      ...selectedFeaturesState,
      currentPanel: 'datasetView',
      mode: {datasets: ['tacos_toy']},
    });
    expect(prev).toBeUndefined();
  });

  test.each([{}, {hideSelectLabel: true}])(
    'selectDataset moves on to datasetView with mode %o',
    mode => {
      const {next} = prevNextButtons({
        ...dataUploadedState,
        currentPanel: 'selectDataset',
        mode,
      });
      expect(next.panel).toBe('datasetView');
    },
  );

  test('results tries again on datasetView', () => {
    const {prev} = prevNextButtons({
      ...resultsState,
      currentPanel: 'results',
      historicResults: [{accuracy: '100'}],
    });
    expect(prev.panel).toBe('datasetView');
  });
});
