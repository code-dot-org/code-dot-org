import {ThemeProvider} from '@mui/material/styles';
import {render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import I18n from '../../src/i18n';
import train from '../../src/train';
import Results from '../../src/UIComponents/Results';

import {levelStore} from './levelStore';

function renderTrainedResults(mode) {
  const store = levelStore(mode);
  train.reset();
  train.init(store);
  train.onClickTrain();
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(Results),
      ),
    ),
  );
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
