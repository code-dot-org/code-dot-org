import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import reducer, {
  initialState,
  setCurrentPanel,
  setCurrentColumn,
  setColumnsByDataType,
  setInstructionsEnabled,
  setTestData,
  setPrediction,
  playPredictionStep,
  setPredictionPlaying,
  stepPredictionByHand,
  setMode,
  setReserveLocation,
  setImportedData,
  resetState,
  setSaveStatus,
  saveModel,
  setTrainingModalStep,
} from '@cdo/apps/ailab/engine/redux';
import {initialProject} from '@cdo/apps/ailab/engine/types';

describe('ailab reducer', () => {
  describe('instructionsEnabled gates the panel overlay', () => {
    test('disabled: setCurrentPanel never activates the overlay', () => {
      const next = reducer(initialState, setCurrentPanel('results'));
      expect(next.instructionsOverlayActive).toBe(false);
      expect(next.viewedPanels).toEqual([]);
    });

    test('enabled: first visit activates the overlay and records the panel', () => {
      const enabled = reducer(initialState, setInstructionsEnabled(true));
      const next = reducer(enabled, setCurrentPanel('results'));
      expect(next.instructionsOverlayActive).toBe(true);
      expect(next.viewedPanels).toContain('results');
    });

    test('enabled: a second visit to the same panel does not re-activate it', () => {
      let state = reducer(initialState, setInstructionsEnabled(true));
      state = reducer(state, setCurrentPanel('results'));
      const next = reducer(state, setCurrentPanel('results'));
      expect(next.instructionsOverlayActive).toBe(false);
    });

    test('enabled but mode hides the overlay: never activates', () => {
      let state = reducer(initialState, setInstructionsEnabled(true));
      state = reducer(state, setMode({hideInstructionsOverlay: true}));
      const next = reducer(state, setCurrentPanel('results'));
      expect(next.instructionsOverlayActive).toBe(false);
      expect(next.viewedPanels).toEqual([]);
    });
  });

  describe('training modal', () => {
    test('opens on a step and closes', () => {
      const opened = reducer(initialState, setTrainingModalStep('training'));
      expect(opened.trainingModalStep).toBe('training');
      const closed = reducer(opened, setTrainingModalStep(undefined));
      expect(closed.trainingModalStep).toBeUndefined();
    });

    test('closes when moving to another panel', () => {
      const opened = reducer(initialState, setTrainingModalStep('testing'));
      const next = reducer(opened, setCurrentPanel('results'));
      expect(next.trainingModalStep).toBeUndefined();
    });

    test('does not change the instructions while open', () => {
      let state = reducer(initialState, setCurrentPanel('datasetView'));
      state = reducer(state, setTrainingModalStep('training'));
      expect(state.instructionsKey).toBe('datasetView');
    });
  });

  describe('setCurrentPanel per-panel resets', () => {
    test.each([{}, {hideSelectLabel: true}])(
      'datasetView clears the current column, mode %o',
      mode => {
        let state = reducer(initialState, setMode(mode));
        state = reducer(state, setCurrentColumn('a'));
        const next = reducer(state, setCurrentPanel('datasetView'));
        expect(next.currentColumn).toBeUndefined();
      }
    );

    test('results clears prediction state but keeps the current column', () => {
      let state = reducer(initialState, setCurrentColumn('a'));
      state = reducer(state, setTestData('a', 5));
      state = reducer(state, setPrediction(1));
      const next = reducer(state, setCurrentPanel('results'));
      expect(next.testData).toEqual({});
      expect(next.prediction).toBeUndefined();
      // The results branch intentionally does not reset currentColumn.
      expect(next.currentColumn).toBe('a');
    });
  });

  describe('setCurrentColumn', () => {
    test('selects, then deselects on a repeated click', () => {
      const selected = reducer(initialState, setCurrentColumn('a'));
      expect(selected.currentColumn).toBe('a');
      const deselected = reducer(selected, setCurrentColumn('a'));
      expect(deselected.currentColumn).toBeUndefined();
    });

    test('selects the label column on the dataset view', () => {
      let state = reducer(
        initialState,
        setColumnsByDataType('lbl', ColumnTypes.NUMERICAL)
      );
      state = reducer(state, setCurrentPanel('datasetView'));
      const next = reducer(state, setCurrentColumn('lbl'));
      expect(next.currentColumn).toBe('lbl');
      expect(next.instructionsKey).toBe('datasetView');
    });

    test('ignores clicks when the mode hides column clicking', () => {
      const state = reducer(initialState, setMode({hideColumnClicking: true}));
      const next = reducer(state, setCurrentColumn('a'));
      expect(next.currentColumn).toBeUndefined();
    });
  });

  describe('setPrediction', () => {
    test('shows the whole of the new path, not the step of the last one', () => {
      const stepped = reducer(initialState, playPredictionStep(2));
      const next = reducer(stepped, setPrediction(1, [0]));
      expect(next.predictionStep).toBeUndefined();
    });

    test('stops the last path playing', () => {
      const playing = reducer(initialState, setPredictionPlaying(true));
      const next = reducer(playing, setPrediction(1, [0]));
      expect(next.predictionPlaying).toBe(false);
    });

    test('counts each prediction, even one that repeats the last', () => {
      const first = reducer(initialState, setPrediction(1, [0]));
      const next = reducer(first, setPrediction(1, [0]));
      expect(next.predictionCount).toBe(first.predictionCount + 1);
    });

    test('forgets that the student stepped the last path by hand', () => {
      const stepped = reducer(initialState, stepPredictionByHand(1));
      const next = reducer(stepped, setPrediction(1, [0]));
      expect(next.predictionStepByHand).toBe(false);
    });
  });

  describe('stepping a prediction', () => {
    test('marks a step taken by hand', () => {
      const next = reducer(initialState, stepPredictionByHand(1));
      expect(next.predictionStep).toBe(1);
      expect(next.predictionStepByHand).toBe(true);
    });

    test('clears the mark when playback sets the step', () => {
      const stepped = reducer(initialState, stepPredictionByHand(1));
      const next = reducer(stepped, playPredictionStep(0));
      expect(next.predictionStep).toBe(0);
      expect(next.predictionStepByHand).toBe(false);
    });

    test('stops playback when the student steps by hand', () => {
      const playing = reducer(initialState, setPredictionPlaying(true));
      const next = reducer(playing, stepPredictionByHand(1));
      expect(next.predictionPlaying).toBe(false);
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
      state = reducer(state, setCurrentColumn('a'));
      state = reducer(state, setCurrentPanel('results'));
      const next = reducer(state, resetState());
      expect(next.mode).toEqual({datasets: ['d1']});
      expect(next.reserveLocation).toBe('random');
      expect(next.currentColumn).toBeUndefined();
      expect(next.currentPanel).toBe('selectDataset');
    });

    test('preserves instructionsEnabled through reset', () => {
      const enabled = reducer(initialState, setInstructionsEnabled(true));
      const next = reducer(enabled, resetState());
      expect(next.instructionsEnabled).toBe(true);
    });
  });

  describe('instructionsKey selection', () => {
    test('setCurrentPanel records the panel as the key; showOverlay tracks first visit', () => {
      const enabled = reducer(initialState, setInstructionsEnabled(true));
      const first = reducer(enabled, setCurrentPanel('results'));
      expect(first.instructionsKey).toBe('results');
      expect(first.showOverlay).toBe(true);
      const second = reducer(first, setCurrentPanel('results'));
      expect(second.instructionsKey).toBe('results');
      expect(second.showOverlay).toBe(false);
    });

    test('setCurrentPanel sets showOverlay false when instructions are disabled', () => {
      const next = reducer(initialState, setCurrentPanel('results'));
      expect(next.instructionsKey).toBe('results');
      expect(next.showOverlay).toBe(false);
    });

    test('selecting a feature column leaves the instructions alone', () => {
      let state = reducer(
        initialState,
        setColumnsByDataType('a', ColumnTypes.NUMERICAL)
      );
      state = reducer(state, setCurrentPanel('datasetView'));
      const next = reducer(state, setCurrentColumn('a'));
      expect(next.currentColumn).toBe('a');
      expect(next.instructionsKey).toBe('datasetView');
    });

    test('importing a dataset records uploaded vs selected', () => {
      const uploaded = reducer(initialState, setImportedData([], true));
      expect(uploaded.instructionsKey).toBe('uploadedDataset');
      const selected = reducer(initialState, setImportedData([], false));
      expect(selected.instructionsKey).toBe('selectedDataset');
    });
  });

  // saveModel is a thunk; invoke its inner (dispatch, getState) directly with a
  // recording dispatch and a stub save callback — no store/middleware needed.
  describe('saveModel thunk', () => {
    const runSaveModel = (saveResponse, trainedModel) => {
      const state = initialState;
      const actions = [];
      const saved = [];
      const save = (dataToSave, callback) => {
        saved.push(dataToSave);
        callback(saveResponse);
      };
      saveModel(
        save,
        {...initialProject, labelColumn: 'a'},
        trainedModel
      )(
        action => actions.push(action),
        () => state
      );
      return {actions, saved};
    };

    test('marks the save started, then applies a success response', () => {
      const {actions} = runSaveModel({status: 'success'});
      expect(setSaveStatus.match(actions[0])).toBe(true);
      expect(actions[0].payload.status).toBe('started');
      expect(actions[1].payload.status).toBe('success');
      expect(setCurrentPanel.match(actions[2])).toBe(true);
      expect(actions[2].payload).toBe('modelSummary');
    });

    test('an error response returns to the save panel', () => {
      const {actions} = runSaveModel({status: 'error'});
      expect(actions[actions.length - 1].payload).toBe('saveModel');
    });

    test('saves the model it is handed, which Redux no longer holds', () => {
      const model = {toJSON: () => ({name: 'KNN'}), predict: () => []};
      const {saved} = runSaveModel({status: 'success'}, model);
      expect(saved[0].trainedModel).toEqual({name: 'KNN'});

      const {saved: untrained} = runSaveModel({status: 'success'});
      expect(untrained[0].trainedModel).toBeNull();
    });
  });
});
