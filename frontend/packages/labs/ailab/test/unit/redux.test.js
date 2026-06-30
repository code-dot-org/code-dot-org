import {ColumnTypes} from '../../src/constants';
import reducer, {
  initialState,
  setCurrentPanel,
  setCurrentColumn,
  setLabelColumn,
  setColumnsByDataType,
  setInstructionsEnabled,
  addSelectedFeature,
  setTestData,
  setPrediction,
  setMode,
  setReserveLocation,
  setShowResultsDetails,
  setImportedData,
  resetState,
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
      state = reducer(state, setColumnsByDataType('lbl', ColumnTypes.NUMERICAL));
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
      expect(next.currentPanel).toBe('selectDataset');
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
      let state = reducer(initialState, setColumnsByDataType('a', ColumnTypes.NUMERICAL));
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
      const uploaded = reducer(initialState, setImportedData([], true));
      expect(uploaded.instructionsKey).toBe('uploadedDataset');
      const selected = reducer(initialState, setImportedData([], false));
      expect(selected.instructionsKey).toBe('selectedDataset');
    });
  });
});
