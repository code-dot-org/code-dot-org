import {screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '../../src/i18n';
import Results from '../../src/UIComponents/Results';

import {levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

function renderTrainedResults(mode) {
  const store = levelStore(mode);
  const trainingRun = runTraining(store);
  renderWithProviders(createElement(Results), {store, trainingRun});
}

function testPanel() {
  return screen.getByRole('button', {name: 'Predict'}).closest('#test-panel');
}

describe('Results', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('a decision tree floats the Test panel on its canvas, outside the diagram', () => {
    renderTrainedResults({trainer: 'decisionTree'});

    expect(
      document.getElementById('uitest-decision-tree').contains(testPanel()),
    ).toBe(true);
    expect(
      screen
        .getByRole('tree', {name: "Your model's decision tree"})
        .contains(testPanel()),
    ).toBe(false);
  });

  test('a model without a tree still shows the Test panel', () => {
    renderTrainedResults(undefined);

    expect(document.getElementById('uitest-decision-tree')).toBeNull();
    expect(testPanel()).not.toBeNull();
  });
});
