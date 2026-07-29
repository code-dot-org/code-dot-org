import {Algorithms, ColumnTypes} from '../../src/constants';
import reducer, {
  initialState,
  setCurrentPanel,
  setCurrentColumn,
  setLabelColumn,
  setColumnsByDataType,
  setInstructionsEnabled,
  addSelectedFeature,
  setTestData,
  setTestDataFromExample,
  setPrediction,
  setMode,
  setReserveLocation,
  setShowResultsDetails,
  setImportedData,
  resetState,
  resetDatasetState,
  setSaveStatus,
  setSelectedAlgorithm,
  getPredictAvailable,
  saveModel,
} from '../../src/redux';

describe('ailab reducer', () => {
  describe('instructionsEnabled gates the panel overlay', () => {
    test('disabled: setCurrentPanel never activates the overlay', () => {
      const next = reducer(initialState, setCurrentPanel('trainModel'));
      expect(next.instructionsOverlayActive).toBe(false);
      expect(next.viewedPanels).toEqual([]);
    });

    test('enabled: first visit activates the overlay and records the panel', () => {
      const enabled = reducer(initialState, setInstructionsEnabled(true));
      const next = reducer(enabled, setCurrentPanel('trainModel'));
      expect(next.instructionsOverlayActive).toBe(true);
      expect(next.viewedPanels).toContain('trainModel');
    });

    test('enabled: a second visit to the same panel does not re-activate it', () => {
      let state = reducer(initialState, setInstructionsEnabled(true));
      state = reducer(state, setCurrentPanel('trainModel'));
      const next = reducer(state, setCurrentPanel('trainModel'));
      expect(next.instructionsOverlayActive).toBe(false);
    });

    test('enabled but mode hides the overlay: never activates', () => {
      let state = reducer(initialState, setInstructionsEnabled(true));
      state = reducer(state, setMode({hideInstructionsOverlay: true}));
      const next = reducer(state, setCurrentPanel('trainModel'));
      expect(next.instructionsOverlayActive).toBe(false);
      expect(next.viewedPanels).toEqual([]);
    });
  });

  describe('setCurrentPanel per-panel resets', () => {
    test('dataDisplayLabel clears the selected features and current column', () => {
      let state = reducer(initialState, addSelectedFeature('a'));
      state = reducer(state, setCurrentColumn('a'));
      const next = reducer(state, setCurrentPanel('dataDisplayLabel'));
      expect(next.selectedFeatures).toEqual([]);
      expect(next.currentColumn).toBeUndefined();
    });

    test('results clears prediction state but keeps the current column', () => {
      let state = reducer(initialState, setCurrentColumn('a'));
      state = reducer(state, setTestData('a', 5));
      state = reducer(state, setPrediction(1));
      const next = reducer(state, setCurrentPanel('results'));
      expect(next.testData).toEqual({});
      expect(next.prediction).toBeUndefined();
      expect(next.showResultsDetails).toBe(false);
      // The results branch intentionally does not reset currentColumn.
      expect(next.currentColumn).toBe('a');
    });
  });

  describe('addSelectedFeature', () => {
    test('appends a new feature', () => {
      const next = reducer(initialState, addSelectedFeature('a'));
      expect(next.selectedFeatures).toEqual(['a']);
    });

    test('is idempotent for an already-selected feature', () => {
      const once = reducer(initialState, addSelectedFeature('a'));
      const twice = reducer(once, addSelectedFeature('a'));
      expect(twice.selectedFeatures).toEqual(['a']);
    });

    test('clears trained output when the model features change', () => {
      const trainedState = {
        ...initialState,
        selectedFeatures: ['a'],
        trainingExamples: [[1]],
        trainingLabels: [1],
        accuracyCheckExamples: [[2]],
        accuracyCheckLabels: [2],
        accuracyCheckPredictedLabels: [2],
        testData: {a: 1},
        prediction: 1,
        trainedModel: {},
        kValue: 3,
        saveStatus: 'success',
        saveResponseData: {type: 'profanity'},
      };

      const next = reducer(trainedState, addSelectedFeature('b'));
      expect(next.selectedFeatures).toEqual(['a', 'b']);
      expect(next.trainingExamples).toEqual([]);
      expect(next.trainingLabels).toEqual([]);
      expect(next.accuracyCheckExamples).toEqual([]);
      expect(next.accuracyCheckLabels).toEqual([]);
      expect(next.accuracyCheckPredictedLabels).toEqual([]);
      expect(next.testData).toEqual({});
      expect(next.prediction).toBeUndefined();
      expect(next.trainedModel).toBeUndefined();
      expect(next.kValue).toBeNull();
      expect(next.saveStatus).toBe('notStarted');
      expect(next.saveResponseData).toBeUndefined();
    });
  });

  describe('setCurrentColumn', () => {
    test('selects, then deselects on a repeated click', () => {
      const selected = reducer(initialState, setCurrentColumn('a'));
      expect(selected.currentColumn).toBe('a');
      const deselected = reducer(selected, setCurrentColumn('a'));
      expect(deselected.currentColumn).toBeUndefined();
    });

    test('ignores a click on the label column during feature selection', () => {
      let state = reducer(initialState, setLabelColumn('lbl'));
      state = reducer(
        state,
        setColumnsByDataType('lbl', ColumnTypes.NUMERICAL),
      );
      state = reducer(state, setCurrentPanel('dataDisplayFeatures'));
      const next = reducer(state, setCurrentColumn('lbl'));
      expect(next.currentColumn).toBeUndefined();
    });
  });

  describe('setTestData', () => {
    test('records the value and clears any stale prediction', () => {
      const predicted = reducer(initialState, setPrediction(1));
      const next = reducer(predicted, setTestData('a', 5));
      expect(next.testData).toEqual({a: 5});
      expect(next.prediction).toBeUndefined();
    });

    test('treats zero as a complete test value', () => {
      const state = {
        ...initialState,
        selectedFeatures: ['a'],
        testData: {a: 0},
      };
      expect(getPredictAvailable(state)).toBe(true);
    });

    test('loads an example row into test data and clears any stale prediction', () => {
      const predicted = {
        ...initialState,
        selectedFeatures: ['weather', 'temp'],
        prediction: 'yes',
      };
      const next = reducer(
        predicted,
        setTestDataFromExample({
          features: ['weather', 'temp'],
          example: ['sunny', 'hot'],
        }),
      );
      expect(next.testData).toEqual({weather: 'sunny', temp: 'hot'});
      expect(next.prediction).toBeUndefined();
    });
  });

  describe('resetState', () => {
    test('preserves mode and reserveLocation, resets the rest', () => {
      let state = reducer(initialState, setMode({datasets: ['d1']}));
      state = reducer(state, setReserveLocation('random'));
      state = reducer(state, addSelectedFeature('a'));
      state = reducer(state, setCurrentPanel('trainModel'));
      const next = reducer(state, resetState());
      expect(next.mode).toEqual({datasets: ['d1']});
      expect(next.reserveLocation).toBe('random');
      expect(next.selectedFeatures).toEqual([]);
      expect(next.currentPanel).toBe('selectAlgorithm');
    });

    test('preserves instructionsEnabled through reset', () => {
      const enabled = reducer(initialState, setInstructionsEnabled(true));
      const next = reducer(enabled, resetState());
      expect(next.instructionsEnabled).toBe(true);
    });
  });

  describe('resetDatasetState', () => {
    test('preserves algorithm and panel while clearing data setup', () => {
      let state = reducer(
        initialState,
        setSelectedAlgorithm(Algorithms.DECISION_TREE),
      );
      state = reducer(state, setCurrentPanel('selectDataset'));
      state = reducer(state, setImportedData([{a: 1}], false));
      state = reducer(state, setLabelColumn('a'));
      const next = reducer(state, resetDatasetState());
      expect(next.selectedAlgorithm).toBe(Algorithms.DECISION_TREE);
      expect(next.currentPanel).toBe('selectDataset');
      expect(next.data).toEqual([]);
      expect(next.labelColumn).toBeUndefined();
    });
  });

  describe('setSelectedAlgorithm', () => {
    test('records the selected algorithm and clears trained output', () => {
      const trainedState = {
        ...initialState,
        selectedAlgorithm: Algorithms.KNN,
        accuracyCheckExamples: [[1]],
        accuracyCheckPredictedLabels: [1],
        trainedModel: {},
      };
      const next = reducer(
        trainedState,
        setSelectedAlgorithm(Algorithms.DECISION_TREE),
      );
      expect(next.selectedAlgorithm).toBe(Algorithms.DECISION_TREE);
      expect(next.accuracyCheckExamples).toEqual([]);
      expect(next.accuracyCheckPredictedLabels).toEqual([]);
      expect(next.trainedModel).toBeUndefined();
    });
  });

  describe('instructionsKey selection', () => {
    test('setCurrentPanel records the panel as the key; showOverlay tracks first visit', () => {
      const enabled = reducer(initialState, setInstructionsEnabled(true));
      const first = reducer(enabled, setCurrentPanel('trainModel'));
      expect(first.instructionsKey).toBe('trainModel');
      expect(first.showOverlay).toBe(true);
      const second = reducer(first, setCurrentPanel('trainModel'));
      expect(second.instructionsKey).toBe('trainModel');
      expect(second.showOverlay).toBe(false);
    });

    test('setCurrentPanel sets showOverlay false when instructions are disabled', () => {
      const next = reducer(initialState, setCurrentPanel('trainModel'));
      expect(next.instructionsKey).toBe('trainModel');
      expect(next.showOverlay).toBe(false);
    });

    test('selecting a numerical feature records selectedFeatureNumerical', () => {
      let state = reducer(
        initialState,
        setColumnsByDataType('a', ColumnTypes.NUMERICAL),
      );
      state = reducer(state, setCurrentPanel('dataDisplayFeatures'));
      const next = reducer(state, setCurrentColumn('a'));
      expect(next.instructionsKey).toBe('selectedFeatureNumerical');
      expect(next.showOverlay).toBe(false);
    });

    test('the results-details toggle records resultsDetails / results', () => {
      const open = reducer(initialState, setShowResultsDetails(true));
      expect(open.instructionsKey).toBe('resultsDetails');
      const closed = reducer(open, setShowResultsDetails(false));
      expect(closed.instructionsKey).toBe('results');
    });

    test('importing a dataset records uploaded vs selected', () => {
      const selectDataset = reducer(
        initialState,
        setCurrentPanel('selectDataset'),
      );
      const uploaded = reducer(selectDataset, setImportedData([], true));
      expect(uploaded.instructionsKey).toBe('uploadedDataset');
      const selected = reducer(selectDataset, setImportedData([], false));
      expect(selected.instructionsKey).toBe('selectedDataset');
    });
  });

  // saveModel is a thunk; invoke its inner (dispatch, getState) directly with a
  // recording dispatch and a stub save callback — no store/middleware needed.
  describe('saveModel thunk', () => {
    const runSaveModel = saveResponse => {
      const state = reducer(initialState, setLabelColumn('a'));
      const actions = [];
      const save = (_dataToSave, callback) => callback(saveResponse);
      saveModel(save)(
        action => actions.push(action),
        () => state,
      );
      return actions;
    };

    test('marks the save started, then applies a success response', () => {
      const actions = runSaveModel({status: 'success'});
      expect(setSaveStatus.match(actions[0])).toBe(true);
      expect(actions[0].payload.status).toBe('started');
      expect(actions[1].payload.status).toBe('success');
      expect(setCurrentPanel.match(actions[2])).toBe(true);
      expect(actions[2].payload).toBe('modelSummary');
    });

    test('an error response returns to the export panel', () => {
      const actions = runSaveModel({status: 'error'});
      expect(actions[actions.length - 1].payload).toBe('exportModel');
    });
  });
});
