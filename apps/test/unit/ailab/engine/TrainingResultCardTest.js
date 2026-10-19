import {act, fireEvent, screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import {setTrainingModalStep} from '@cdo/apps/ailab/engine/redux';
import TrainingResultCard from '@cdo/apps/ailab/engine/UIComponents/TrainingResultCard';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

function renderCard({trained = true, trainer = 'decisionTree', run} = {}) {
  I18n.initI18n();
  const store = levelStore({trainer});
  const project = levelProject();
  const trainingRun =
    run ?? (trained ? runTraining(store, project) : undefined);
  return renderWithProviders(createElement(TrainingResultCard), {
    store,
    project,
    trainingRun,
  });
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
    renderCard({
      run: {
        historicResult: {
          label: 'animal',
          features: ['legs'],
          accuracy: '83.33',
          correct: 5,
          total: 6,
        },
      },
    });
    expect(screen.getByText('83.33%')).not.toBeNull();
    expect(screen.getByText('5/6')).not.toBeNull();
  });

  test('Test model opens the testing view', () => {
    const {store} = renderCard();
    fireEvent.click(screen.getByRole('button', {name: 'Test model'}));
    expect(store.getState().currentPanel).toBe('results');
  });

  test('shows the tree mini map after decision tree training', () => {
    renderCard();
    expect(
      screen.getByRole('button', {name: 'Replay training'})
    ).not.toBeNull();
  });

  test('has no mini map after nearest neighbor training', () => {
    renderCard({trainer: 'knn'});
    expect(accuracy()).not.toBeNull();
    expect(screen.queryByRole('button', {name: 'Replay training'})).toBeNull();
  });

  test('Replay training reopens the modal and keeps the card', () => {
    const {store} = renderCard();
    fireEvent.click(screen.getByRole('button', {name: 'Replay training'}));
    expect(store.getState().trainingModalStep).toBe('training');
    expect(accuracy()).not.toBeNull();
  });

  test('takes focus when the training modal closes and focus was lost', () => {
    const {store} = renderCard();
    act(() => {
      store.dispatch(setTrainingModalStep('training'));
    });
    act(() => {
      store.dispatch(setTrainingModalStep(undefined));
    });
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Test model'})
    );
  });

  test('stays hidden while the training modal is open', () => {
    const {store} = renderCard();
    act(() => {
      store.dispatch(setTrainingModalStep('training'));
    });
    expect(accuracy()).toBeNull();
  });

  test('hides once the features change', () => {
    const {projectActions} = renderCard();
    act(() => projectActions().removeSelectedFeature('legs'));
    expect(accuracy()).toBeNull();
  });

  test('hides once the label changes', () => {
    const {projectActions} = renderCard();
    act(() => projectActions().setLabelColumn('legs'));
    expect(accuracy()).toBeNull();
  });
});
