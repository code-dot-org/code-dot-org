import {
  isPanelEnabled,
  prevNextButtons,
  uniqLabelFeaturesSelected,
} from '../../src/helpers/navigationValidation';
import I18n from '../../src/i18n';

const initialState = {
  data: [],
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

const resultsState = {
  ...dataUploadedState,
  accuracyCheckExamples: [0, 0],
};

const noProject = {
  labelColumn: undefined,
  selectedFeatures: [],
  historicResults: [],
};

const selectedLabelProject = {...noProject, labelColumn: 'isEvil'};

const selectedFeaturesProject = {
  ...selectedLabelProject,
  selectedFeatures: ['house'],
};

/*
  Given the constraints of the UI, this is not a state we expect users to ever
  be in, but it's important that the model training step happen only when
  features and label are unique.
*/
const sameFeatureLabelProject = {
  ...noProject,
  labelColumn: 'isEvil',
  selectedFeatures: ['isEvil'],
};

const trainedProject = {
  ...selectedFeaturesProject,
  historicResults: [{label: 'isEvil', features: ['house'], accuracy: '100'}],
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
    const result = isPanelEnabled(initialState, noProject, 'datasetView');
    expect(result).toBe(false);
  });

  test('datasetView - enabled', async () => {
    const result = isPanelEnabled(dataUploadedState, noProject, 'datasetView');
    expect(result).toBe(true);
  });

  test('selectFeatures - disabled', async () => {
    const result = isPanelEnabled(
      dataUploadedState,
      selectedLabelProject,
      'selectFeatures'
    );
    expect(result).toBe(false);
  });

  test('selectFeatures - enabled', async () => {
    const result = isPanelEnabled(
      dataUploadedState,
      selectedFeaturesProject,
      'selectFeatures'
    );
    expect(result).toBe(true);
  });

  test('results - disabled', async () => {
    const result = isPanelEnabled(
      dataUploadedState,
      selectedFeaturesProject,
      'results'
    );
    expect(result).toBe(false);
  });

  test('results - enabled', async () => {
    const result = isPanelEnabled(resultsState, trainedProject, 'results');
    expect(result).toBe(true);
  });

  test('modelSummary - disabled, no model name', async () => {
    const result = isPanelEnabled(resultsState, trainedProject, 'modelSummary');
    expect(result).toBe(false);
  });

  test('modelSummary - disabled, save in progress', async () => {
    const result = isPanelEnabled(
      savingModelState,
      trainedProject,
      'modelSummary'
    );
    expect(result).toBe(false);
  });

  test('modelSummary - enabled', async () => {
    const result = isPanelEnabled(
      savedModelState,
      trainedProject,
      'modelSummary'
    );
    expect(result).toBe(true);
  });
});

describe('uniqLabelFeaturesSelected', () => {
  test('false when a feature is also the label', () => {
    expect(uniqLabelFeaturesSelected(sameFeatureLabelProject)).toBe(false);
  });

  test('true when the label and features differ', () => {
    expect(uniqLabelFeaturesSelected(selectedFeaturesProject)).toBe(true);
  });
});

describe('isPanelEnabled for results after training', () => {
  const trainedState = resultsState;
  const project = {
    ...noProject,
    labelColumn: 'isEvil',
    selectedFeatures: ['house', 'name'],
    historicResults: [
      {label: 'isEvil', features: ['house', 'name'], accuracy: '100'},
    ],
  };

  test('disabled before any training', () => {
    expect(isPanelEnabled(resultsState, noProject, 'results')).toBe(false);
  });

  test('enabled when the columns match the latest training', () => {
    expect(isPanelEnabled(trainedState, project, 'results')).toBe(true);
  });

  test.each([
    ['label', {labelColumn: 'wand'}],
    ['features', {selectedFeatures: ['house']}],
    ['feature order', {selectedFeatures: ['name', 'house']}],
  ])('disabled when the %s changed since training', (_, changes) => {
    expect(
      isPanelEnabled(trainedState, {...project, ...changes}, 'results')
    ).toBe(false);
  });
});

describe('prevNextButtons on the data panels', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test.each([undefined, {datasets: ['a', 'b']}])(
    'datasetView never goes back to the hidden dataset picker with mode %o',
    mode => {
      const {prev, next} = prevNextButtons(
        {...dataUploadedState, currentPanel: 'datasetView', mode},
        selectedFeaturesProject
      );
      expect(prev).toBeUndefined();
      expect(next).toBeUndefined();
    }
  );

  test.each([{}, {hideSelectLabel: true}])(
    'selectDataset moves on to datasetView with mode %o',
    mode => {
      const {next} = prevNextButtons(
        {...dataUploadedState, currentPanel: 'selectDataset', mode},
        noProject
      );
      expect(next.panel).toBe('datasetView');
    }
  );

  test('results has neither button; the Dataset tab goes back', () => {
    const {prev, next} = prevNextButtons(
      {...resultsState, currentPanel: 'results'},
      trainedProject
    );
    expect(prev).toBeUndefined();
    expect(next).toBeUndefined();
  });
});
