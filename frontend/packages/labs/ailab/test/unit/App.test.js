import {act, screen} from '@testing-library/react';
import {createElement} from 'react';

import App from '../../src/App';
import I18n from '../../src/i18n';
import {
  resetState,
  setCurrentPanel,
  setMode,
  setPresetColumns,
} from '../../src/redux';
import {store as storeSingleton} from '../../src/store';

import {levelProject, levelStore, seedLevel} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderApp(mode) {
  const store = levelStore(mode);
  const project = levelProject();
  const onTrained = vi.fn();
  const {trainModel} = renderWithProviders(
    createElement(App, {
      onContinue: () => {},
      saveTrainedModel: () => {},
      onStartOver: () => {},
      onTrained,
    }),
    {store, project},
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
  beforeEach(() => I18n.initI18n());

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
    const onTrained = vi.fn();
    const {trainingData} = renderWithProviders(
      createElement(App, {
        onContinue: () => {},
        saveTrainedModel: () => {},
        onStartOver: () => {},
        onTrained,
      }),
      {store: storeSingleton, project: levelProject()},
    );
    return {onTrained, trainingData};
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
        setPresetColumns({labelColumn: 'animal', selectedFeatures: ['legs']}),
      );
    });
    expect(onTrained.mock.calls).toEqual([[100]]);
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
    expect(storeSingleton.getState().currentPanel).toBe('datasetView');
    expect(screen.queryByRole('heading', {name: 'Train'})).toBeNull();

    act(() => {
      seedLevel(storeSingleton, hiding);
      storeSingleton.dispatch(
        setPresetColumns({labelColumn: 'animal', selectedFeatures: ['legs']}),
      );
    });
    expect(storeSingleton.getState().currentPanel).toBe('results');
  });

  test('hides Start over', () => {
    renderLevel(PRETRAINED);
    expect(screen.queryByRole('button', {name: 'Start over'})).toBeNull();
  });
});
