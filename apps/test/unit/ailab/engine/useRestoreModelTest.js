/*
  A saved project carries what a run needs but not the model, which is a live
  object. These cover rebuilding it when the lab opens that project.

  The trainer works against the store singleton, so these do too.
*/
import {act} from '@testing-library/react';
import {createElement} from 'react';

import App from '@cdo/apps/ailab/engine/App';
import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  resetState,
  setColumnsByDataType,
  setCurrentPanel,
  setImportedData,
  setMode,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';
import train from '@cdo/apps/ailab/engine/train';
import {defaultProject} from '@cdo/apps/ailab/engine/types';

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
  I18n.initI18n();
  store.dispatch(resetState());
  train.reset();
  store.dispatch(setImportedData(DATA, false));
  ['temperature', 'cost', 'rain'].forEach(column =>
    store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
  );
  store.dispatch(setCurrentPanel('datasetView'));
});

afterEach(() => I18n.reset());

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

/*
  Clicking a dataset loads it while the picker is still open, so a level that
  lets the student choose opens their project before they have chosen.
*/
test('leaves a student who is still choosing a dataset on the picker', () => {
  const saved = savedAfterTraining();
  store.dispatch(setCurrentPanel('selectDataset'));

  const rendered = openLab(saved);

  expect(store.getState().currentPanel).toBe('selectDataset');
  expect(rendered.trainingData().trainedModel).toBeDefined();
});

// The project already names the run; recording it again would list it twice.
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

/*
  A pretrained level trains on load. With a run to rebuild there is nothing
  for it to do, or it would record a second run every time the page opened.
*/
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

/*
  A pretrained level offers neither a retrain nor a Start Over, so a run it
  cannot rebuild has to be replaced rather than waited on. The history is no
  guide: it outlives the run that produced it.
*/
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

  // Reconciliation drops a run the columns no longer match, keeping the history.
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
