import {act, fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '../../src/i18n';
import {
  removeSelectedFeature,
  setHistoricResult,
  setLabelColumn,
  setTrainingModalStep,
} from '../../src/redux';
import TrainingResultCard from '../../src/UIComponents/TrainingResultCard';

import {levelStore} from './levelStore';
import {renderWithProviders, trainModel} from './renderWithProviders';

function renderCard({trained = true, trainer = 'decisionTree'} = {}) {
  I18n.initI18n();
  const store = levelStore({trainer});
  const trainedModel = trained ? trainModel(store) : undefined;
  renderWithProviders(createElement(TrainingResultCard), {
    store,
    trainedModel,
  });
  return store;
}

const accuracy = () => screen.queryByText('Accuracy');

describe('TrainingResultCard', () => {
  afterEach(() => I18n.reset());

  test('is empty before training', () => {
    renderCard({trained: false});
    expect(accuracy()).toBeNull();
  });

  test('shows accuracy and number correct after training', () => {
    renderCard();
    expect(screen.getByText('100%')).not.toBeNull();
    expect(screen.getByText('1/1')).not.toBeNull();
  });

  test('shows the stored accuracy, not a rounded one', () => {
    const store = renderCard({trained: false});
    act(() => {
      store.dispatch(setHistoricResult('animal', ['legs'], '83.33', 5, 6));
    });
    expect(screen.getByText('83.33%')).not.toBeNull();
    expect(screen.getByText('5/6')).not.toBeNull();
  });

  test('Test model opens the testing view', () => {
    const store = renderCard();
    fireEvent.click(screen.getByRole('button', {name: 'Test model'}));
    expect(store.getState().currentPanel).toBe('results');
  });

  test('shows the tree mini map after decision tree training', () => {
    renderCard();
    expect(
      screen.getByRole('button', {name: 'Replay training'}),
    ).not.toBeNull();
  });

  test('has no mini map after nearest neighbor training', () => {
    renderCard({trainer: 'knn'});
    expect(accuracy()).not.toBeNull();
    expect(screen.queryByRole('button', {name: 'Replay training'})).toBeNull();
  });

  test('Replay training reopens the modal and keeps the card', () => {
    const store = renderCard();
    fireEvent.click(screen.getByRole('button', {name: 'Replay training'}));
    expect(store.getState().trainingModalStep).toBe('training');
    expect(accuracy()).not.toBeNull();
  });

  test('takes focus when the training modal closes and focus was lost', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(setTrainingModalStep('training'));
    });
    act(() => {
      store.dispatch(setTrainingModalStep(undefined));
    });
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Test model'}),
    );
  });

  test('stays hidden while the training modal is open', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(setTrainingModalStep('training'));
    });
    expect(accuracy()).toBeNull();
  });

  test('hides once the features change', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(removeSelectedFeature('legs'));
    });
    expect(accuracy()).toBeNull();
  });

  test('hides once the label changes', () => {
    const store = renderCard();
    act(() => {
      store.dispatch(setLabelColumn('legs'));
    });
    expect(accuracy()).toBeNull();
  });
});
