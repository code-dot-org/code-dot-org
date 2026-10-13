import {act, fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';

import {
  removeSelectedFeature,
  setCurrentPanel,
  setPrediction,
} from '../../src/redux';
import WorkspaceHeader from '../../src/UIComponents/WorkspaceHeader';

import {levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

function renderHeader({
  panel = 'datasetView',
  trained = false,
  onStartOver,
} = {}) {
  const store = levelStore({});
  const trainingRun = trained ? runTraining(store) : undefined;
  store.dispatch(setCurrentPanel(panel));
  renderWithProviders(createElement(WorkspaceHeader, {onStartOver}), {
    store,
    trainingRun,
  });
  return store;
}

const tab = name => screen.getByRole('button', {name});

describe('WorkspaceHeader', () => {
  test('shows no tabs outside the dataset and testing panels', () => {
    renderHeader({panel: 'selectDataset'});
    expect(screen.queryByRole('group', {name: 'Workspace view'})).toBeNull();
  });

  test('disables Testing until a model is trained', () => {
    renderHeader();
    expect(tab('Dataset').getAttribute('aria-pressed')).toBe('true');
    expect(tab('Testing').disabled).toBe(true);
  });

  test('Testing opens the results once a model is trained', () => {
    const store = renderHeader({trained: true});
    fireEvent.click(tab('Testing'));
    expect(store.getState().currentPanel).toBe('results');
    expect(tab('Testing').getAttribute('aria-pressed')).toBe('true');
  });

  test('Dataset goes back from the results', () => {
    const store = renderHeader({panel: 'results', trained: true});
    fireEvent.click(tab('Dataset'));
    expect(store.getState().currentPanel).toBe('datasetView');
  });

  test('disables Testing once the columns change after training', () => {
    const store = renderHeader({trained: true});
    act(() => {
      store.dispatch(removeSelectedFeature('legs'));
    });
    expect(tab('Testing').disabled).toBe(true);
  });

  test('clicking the open tab keeps the prediction', () => {
    const store = renderHeader({panel: 'results', trained: true});
    act(() => {
      store.dispatch(setPrediction('dog', [4]));
    });
    fireEvent.click(tab('Testing'));
    expect(store.getState().prediction).toBe('dog');
  });

  test('shows Start over only when the consumer handles it', () => {
    renderHeader();
    expect(screen.queryByRole('button', {name: 'Start over'})).toBeNull();
  });

  test('Start over calls the consumer', () => {
    const onStartOver = vi.fn();
    renderHeader({onStartOver});
    fireEvent.click(screen.getByRole('button', {name: 'Start over'}));
    expect(onStartOver).toHaveBeenCalledTimes(1);
  });
});
