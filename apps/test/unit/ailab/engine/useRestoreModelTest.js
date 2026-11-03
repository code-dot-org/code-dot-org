/*
  A saved project carries what a run needs but not the model, which is a live
  object. These cover rebuilding it when the lab opens that project.

  The trainer works against the store singleton, so these do too.
*/
import {act} from '@testing-library/react';
import {createElement} from 'react';

import App from '@cdo/apps/ailab/engine/App';
import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {hasCurrentTrainingResult} from '@cdo/apps/ailab/engine/helpers/navigationValidation';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  resetState,
  setCurrentPanel,
  setMode,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';
import train from '@cdo/apps/ailab/engine/train';
import {defaultProject} from '@cdo/apps/ailab/engine/types';

import {seedDataset} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

const DATA = [
  {temperature: '0', cost: '20', rain: '1000'},
  {temperature: '50', cost: '25', rain: '1010'},
  {temperature: '100', cost: '30', rain: '1020'},
  {temperature: '150', cost: '35', rain: '1030'},
];

const COLUMNS = {
  labelColumn: 'cost',
  selectedFeatures: ['temperature', 'rain'],
};

beforeEach(() => {
  jest.useFakeTimers();
  I18n.initI18n();
  store.dispatch(resetState());
  // A reset leaves the mode alone, so one level's would outlive its tests.
  store.dispatch(setMode(undefined));
  train.reset();
  seedDataset(store, DATA, {
    temperature: ColumnTypes.NUMERICAL,
    cost: ColumnTypes.NUMERICAL,
    rain: ColumnTypes.NUMERICAL,
  });
  store.dispatch(setCurrentPanel('datasetView'));
});

afterEach(() => {
  I18n.reset();
  jest.useRealTimers();
});

// What the lab would have saved after the student trained once.
function savedAfterTraining() {
  const project = {...defaultProject, ...COLUMNS};
  const run = runTraining(store, project);
  train.reset();
  return {
    ...project,
    hyperparameters: run.hyperparameters,
    accuracyCheckRowIndices: run.accuracyCheckRowIndices,
    historicResults: [run.historicResult],
  };
}

function openLab(saved) {
  const rendered = renderWithProviders(
    createElement(App, {onContinue: () => {}, saveTrainedModel: () => {}}),
    {store}
  );
  act(() => rendered.projectActions().openProject(saved));
  // A pretrained level starts training once the loading overlay has painted.
  act(() => jest.runAllTimers());
  return rendered;
}

test('rebuilds the model a saved project describes', () => {
  const rendered = openLab(savedAfterTraining());

  expect(rendered.trainingData().trainedModel).toBeDefined();
});

test('opens on the results, which the rebuilt model unlocks', () => {
  openLab(savedAfterTraining());

  expect(store.getState().currentPanel).toBe('results');
});

test('leaves a student who is still choosing a dataset on the picker', () => {
  const saved = savedAfterTraining();
  store.dispatch(setCurrentPanel('selectDataset'));

  const rendered = openLab(saved);

  expect(store.getState().currentPanel).toBe('selectDataset');
  expect(rendered.trainingData().trainedModel).toBeDefined();
});

test('leaves the history as the project described it', () => {
  const saved = savedAfterTraining();

  const rendered = openLab(saved);

  expect(rendered.project().historicResults).toEqual(saved.historicResults);
});

test('rebuilds nothing when the project describes no run', () => {
  const rendered = openLab({...defaultProject, ...COLUMNS});

  expect(rendered.trainingData().trainedModel).toBeUndefined();
  expect(store.getState().currentPanel).toBe('datasetView');
});

test('rebuilds rather than retrains on a pretrained level', () => {
  const saved = savedAfterTraining();
  store.dispatch(setMode({pretrained: true}));

  const rendered = openLab(saved);

  expect(rendered.trainingData().trainedModel).toBeDefined();
  expect(rendered.project().historicResults).toEqual(saved.historicResults);
});

test('still pretrains a level with nothing saved', () => {
  store.dispatch(setMode({pretrained: true}));

  const rendered = openLab({...defaultProject, ...COLUMNS});

  expect(rendered.project().historicResults).toHaveLength(1);
});

describe('a pretrained level whose saved run cannot be rebuilt', () => {
  beforeEach(() => store.dispatch(setMode({pretrained: true})));

  test('pretrains when the split no longer fits the dataset', () => {
    const saved = savedAfterTraining();

    const rendered = openLab({...saved, accuracyCheckRowIndices: [99]});

    expect(rendered.trainingData().trainedModel).toBeDefined();
    expect(rendered.project().historicResults.length).toBeGreaterThan(
      saved.historicResults.length
    );
  });

  test('pretrains when reconciliation has already dropped the run', () => {
    const saved = savedAfterTraining();

    const rendered = openLab({
      ...saved,
      hyperparameters: undefined,
      accuracyCheckRowIndices: undefined,
    });

    expect(rendered.trainingData().trainedModel).toBeDefined();
    expect(rendered.project().historicResults.length).toBeGreaterThan(
      saved.historicResults.length
    );
  });
});

describe('a run trained on columns the project has since changed', () => {
  const narrowed = saved => ({...saved, selectedFeatures: ['temperature']});

  test('rebuilds for the columns the run was trained on', () => {
    const saved = savedAfterTraining();

    openLab(narrowed(saved));

    expect(store.getState().accuracyCheckExamples[0]).toHaveLength(
      saved.historicResults[0].features.length
    );
  });

  test('opens the gates on a model that matches them', () => {
    const rendered = openLab(narrowed(savedAfterTraining()));

    act(() => rendered.projectActions().addSelectedFeature('rain'));

    const project = rendered.project();
    expect(hasCurrentTrainingResult(project)).toBe(true);
    expect(store.getState().accuracyCheckExamples[0]).toHaveLength(
      project.selectedFeatures.length
    );
  });

  test('declines when a column the run used has left the dataset', () => {
    const saved = savedAfterTraining();
    const [result] = saved.historicResults;

    const rendered = openLab({
      ...narrowed(saved),
      historicResults: [{...result, features: ['temperature', 'humidity']}],
    });

    expect(rendered.trainingData().trainedModel).toBeUndefined();
  });
});

describe.each([
  ['below one', {k: 0}],
  ['negative', {k: -1}],
  ['not a number', {k: NaN}],
  ['fractional', {k: 1.5}],
])('a saved run whose k is %s', (_name, hyperparameters) => {
  test('declines, leaving the student to retrain', () => {
    const rendered = openLab({...savedAfterTraining(), hyperparameters});

    expect(rendered.trainingData().trainedModel).toBeUndefined();
  });
});

/*
  Only a hand-edited main.json reaches this: a shrunken dataset is turned away
  earlier, by the saved split no longer naming rows it has. The model KNN
  builds is degenerate rather than broken, so it is not worth guarding.
*/
test('rebuilds a saved k larger than the dataset', () => {
  const rendered = openLab({
    ...savedAfterTraining(),
    hyperparameters: {k: 999},
  });

  expect(rendered.trainingData().trainedModel).toBeDefined();
});
