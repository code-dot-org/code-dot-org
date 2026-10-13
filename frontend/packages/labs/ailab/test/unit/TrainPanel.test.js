import {act, screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '../../src/i18n';
import {removeSelectedFeature} from '../../src/redux';
import TrainPanel from '../../src/UIComponents/TrainPanel';

import {levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

function renderPanel({trained = false} = {}) {
  const store = levelStore({});
  const trainingRun = trained ? runTraining(store) : undefined;
  renderWithProviders(createElement(TrainPanel), {store, trainingRun});
  return store;
}

const trainButton = () => screen.queryByRole('button', {name: 'Train model'});

describe('TrainPanel', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('shows Train model before training', () => {
    renderPanel();
    expect(trainButton()).not.toBeNull();
  });

  test('hides Train model while the training results show', () => {
    renderPanel({trained: true});
    expect(screen.getByText('Accuracy')).not.toBeNull();
    expect(trainButton()).toBeNull();
  });

  test('brings Train model back once the columns change', () => {
    const store = renderPanel({trained: true});
    act(() => {
      store.dispatch(removeSelectedFeature('legs'));
    });
    expect(trainButton()).not.toBeNull();
  });
});
