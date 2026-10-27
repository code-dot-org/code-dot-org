import {act, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import App from '@cdo/apps/ailab/engine/App';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {ProjectProvider} from '@cdo/apps/ailab/engine/ProjectContext';
import rootReducer, {
  resetState,
  setCurrentPanel,
  setInvalidData,
  setMode,
  setPresetColumns,
  setSelectedCSV,
} from '@cdo/apps/ailab/engine/redux';
import {store as storeSingleton} from '@cdo/apps/ailab/engine/store';
import {TrainingDataProvider} from '@cdo/apps/ailab/engine/TrainingDataContext';

import {levelProject, levelStore, seedLevel} from './levelStore';
import {renderWithProviders, withTheme} from './renderWithProviders';

function renderApp(mode) {
  const store = levelStore(mode);
  const project = levelProject();
  const onTrained = jest.fn();
  const {trainModel} = renderWithProviders(
    createElement(App, {
      onContinue: () => {},
      saveTrainedModel: () => {},
      onStartOver: () => {},
      onTrained,
    }),
    {store, project}
  );
  return {store, onTrained, trainModel};
}

describe('onTrained', () => {
  beforeEach(() => I18n.initI18n());

  test('is not called before training', () => {
    const {onTrained} = renderApp({});
    expect(onTrained).not.toHaveBeenCalled();
  });

  test('receives the accuracy of every training run', () => {
    const {onTrained, trainModel} = renderApp({trainer: 'decisionTree'});
    trainModel();
    trainModel();
    expect(onTrained.mock.calls).toEqual([[100], [100]]);
  });

  test('is not called when the next level loads', () => {
    const {store, onTrained, trainModel} = renderApp({trainer: 'decisionTree'});
    trainModel();
    act(() => {
      store.dispatch(resetState());
      store.dispatch(setMode({}));
    });
    expect(onTrained).toHaveBeenCalledTimes(1);
  });
});

describe('a level that hides the testing view', () => {
  beforeEach(() => I18n.initI18n());

  test('shows the dataset without the Train panel', () => {
    renderApp({hideTestingView: true});
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.queryByRole('heading', {name: 'Train'})).toBeNull();
  });

  test('hides Start over', () => {
    renderApp({hideTestingView: true});
    expect(screen.queryByRole('button', {name: 'Start over'})).toBeNull();
  });
});

describe('a pretrained level', () => {
  beforeEach(() => {
    I18n.initI18n();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  // Pretraining starts once the loading overlay has painted.
  const paintFrame = () => act(() => jest.runAllTimers());

  const PRETRAINED = {
    trainer: 'decisionTree',
    pretrained: true,
    hideSelectLabel: true,
    lockFeatures: true,
  };

  // Auto-training goes through useTrainingRun, which trains the store singleton.
  function renderLevel(mode) {
    storeSingleton.dispatch(resetState());
    seedLevel(storeSingleton, mode);
    const onTrained = jest.fn();
    const onLoadingChange = jest.fn();
    const {trainingData} = renderWithProviders(
      createElement(App, {
        onContinue: () => {},
        saveTrainedModel: () => {},
        onStartOver: () => {},
        onTrained,
        onLoadingChange,
      }),
      {store: storeSingleton, project: levelProject()}
    );
    paintFrame();
    return {onTrained, onLoadingChange, trainingData};
  }

  test('trains once on load, without the training modal', () => {
    const {onTrained, trainingData} = renderLevel(PRETRAINED);
    expect(onTrained.mock.calls).toEqual([[100]]);
    expect(trainingData().trainedModel).toBeDefined();
    expect(storeSingleton.getState().trainingModalStep).toBeUndefined();
    expect(document.activeElement).toBe(document.body);
  });

  test('waits for its own data and columns after a level change', () => {
    const {onTrained} = renderLevel({trainer: 'decisionTree'});

    act(() => {
      storeSingleton.dispatch(resetState());
      storeSingleton.dispatch(setMode(PRETRAINED));
    });
    expect(onTrained).not.toHaveBeenCalled();

    act(() => {
      seedLevel(storeSingleton, PRETRAINED);
      storeSingleton.dispatch(
        setPresetColumns({labelColumn: 'animal', selectedFeatures: ['legs']})
      );
    });
    paintFrame();
    expect(onTrained.mock.calls).toEqual([[100]]);
  });

  test('reports it is loading until the model is trained', () => {
    const {onLoadingChange, trainingData} = renderLevel({
      trainer: 'decisionTree',
    });

    act(() => {
      storeSingleton.dispatch(resetState());
      seedLevel(storeSingleton, PRETRAINED);
    });
    expect(onLoadingChange).toHaveBeenLastCalledWith(true);

    act(() => {
      storeSingleton.dispatch(
        setPresetColumns({labelColumn: 'animal', selectedFeatures: ['legs']})
      );
    });
    expect(onLoadingChange).toHaveBeenLastCalledWith(true);
    expect(trainingData().trainedModel).toBeUndefined();

    paintFrame();
    expect(onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(trainingData().trainedModel).toBeDefined();
  });

  test('reports it has loaded when its columns leave nothing to train on', () => {
    const {onLoadingChange} = renderLevel({trainer: 'decisionTree'});

    act(() => {
      storeSingleton.dispatch(resetState());
      seedLevel(storeSingleton, PRETRAINED);
      storeSingleton.dispatch(
        setPresetColumns({labelColumn: 'animal', selectedFeatures: []})
      );
    });
    expect(onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('table')).toBeTruthy();
  });

  test('stays on the dataset view once trained', () => {
    renderLevel(PRETRAINED);
    expect(storeSingleton.getState().currentPanel).toBe('datasetView');
  });

  test('shows no dataset view while it loads, then opens on the results', () => {
    const hiding = {...PRETRAINED, hideDatasetView: true};
    renderLevel({trainer: 'decisionTree'});

    act(() => {
      storeSingleton.dispatch(resetState());
      storeSingleton.dispatch(setMode(hiding));
      storeSingleton.dispatch(setCurrentPanel('datasetView'));
    });
    expect(screen.queryByRole('heading', {name: 'Train'})).toBeNull();

    act(() => {
      seedLevel(storeSingleton, hiding);
      storeSingleton.dispatch(
        setPresetColumns({labelColumn: 'animal', selectedFeatures: ['legs']})
      );
    });
    paintFrame();
    expect(storeSingleton.getState().currentPanel).toBe('results');
  });

  test('hides Start over', () => {
    renderLevel(PRETRAINED);
    expect(screen.queryByRole('button', {name: 'Start over'})).toBeNull();
  });
});

describe('a level whose only dataset fails to load', () => {
  beforeEach(() => I18n.initI18n());

  test.each([{}, {hideDatasetView: true}])(
    'reports the failure in place of the lab (mode %j)',
    mode => {
      const store = createStore(rootReducer);
      store.dispatch(setMode(mode));
      store.dispatch(setSelectedCSV('animals.csv'));
      store.dispatch(setCurrentPanel('datasetView'));
      renderWithProviders(
        createElement(App, {
          onContinue: () => {},
          saveTrainedModel: () => {},
          onStartOver: () => {},
        }),
        {store}
      );
      expect(screen.queryByRole('alert')).toBeNull();

      act(() => {
        store.dispatch(setInvalidData('loadFailed'));
      });
      expect(screen.getByRole('alert').textContent).toContain(
        'Dataset could not be loaded'
      );
      expect(screen.queryByRole('heading', {name: 'Train'})).toBeNull();
    }
  );
});

describe('opening a level', () => {
  beforeEach(() => I18n.initI18n());

  // Unlike renderWithProviders, renders App before the project has opened.
  function renderOpening() {
    const onLoadingChange = jest.fn();
    const store = createStore(rootReducer);
    store.dispatch(setMode({}));
    store.dispatch(setCurrentPanel('datasetView'));
    store.dispatch(setSelectedCSV('animals.csv'));
    render(
      withTheme(
        createElement(
          Provider,
          {store},
          createElement(
            ProjectProvider,
            {initialProject: levelProject()},
            createElement(
              TrainingDataProvider,
              null,
              createElement(App, {
                onContinue: () => {},
                saveTrainedModel: () => {},
                onLoadingChange,
              })
            )
          )
        )
      )
    );
    return {store, onLoadingChange};
  }

  test('reports it is loading while the dataset is on its way', () => {
    const {onLoadingChange} = renderOpening();
    expect(onLoadingChange).toHaveBeenLastCalledWith(true);
  });

  test('reports it has loaded once the dataset is in', () => {
    const {store, onLoadingChange} = renderOpening();

    act(() => {
      seedLevel(store, {});
    });
    expect(onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('table')).toBeTruthy();
  });
});

describe('choosing a dataset', () => {
  beforeEach(() => I18n.initI18n());

  function renderPicker() {
    const store = createStore(rootReducer);
    store.dispatch(setMode({}));
    store.dispatch(setCurrentPanel('selectDataset'));
    renderWithProviders(
      createElement(App, {
        onContinue: () => {},
        saveTrainedModel: () => {},
        onStartOver: () => {},
      }),
      {store}
    );
    const picker = () =>
      screen.queryByRole('heading', {name: 'Choose a dataset'});
    return {store, picker};
  }

  test('leaves the picker standing while the dataset loads', () => {
    const {store, picker} = renderPicker();
    const opened = picker();
    expect(opened).toBeTruthy();

    act(() => {
      store.dispatch(setSelectedCSV('animals.csv'));
    });

    // The same node, not a replacement: a remount would empty its state.
    expect(picker()).toBe(opened);
  });
});
