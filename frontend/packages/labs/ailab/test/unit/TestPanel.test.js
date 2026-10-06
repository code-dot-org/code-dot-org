import {ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import {ColumnTypes} from '../../src/constants';
import I18n from '../../src/i18n';
import {setPrediction} from '../../src/redux';
import train from '../../src/train';
import TestPanel from '../../src/UIComponents/TestPanel';

import {levelStore} from './levelStore';

const PENGUINS = [
  {species: 'Adelie', island: 'Torgersen', mass: '3750', bill: '39.1'},
  {species: 'Gentoo', island: 'Biscoe', mass: '5000', bill: '46.25'},
  {species: 'Chinstrap', island: 'Dream', mass: '3500', bill: '49.3'},
];

const PENGUIN_COLUMNS = {
  species: ColumnTypes.CATEGORICAL,
  island: ColumnTypes.CATEGORICAL,
  mass: ColumnTypes.NUMERICAL,
  bill: ColumnTypes.NUMERICAL,
};

function renderTestPanel(store) {
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(TestPanel),
      ),
    ),
  );
}

function trainedAnimalStore(mode) {
  const store = levelStore(mode);
  train.reset();
  train.init(store);
  train.onClickTrain();
  return store;
}

function predictSnake() {
  fireEvent.change(screen.getByLabelText('legs'), {target: {value: '0'}});
  fireEvent.click(predictButton());
}

function predictButton() {
  return screen.getByRole('button', {name: 'Predict'});
}

describe('TestPanel', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('shows a field for each feature, in the order they were chosen', () => {
    renderTestPanel(
      levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species'),
    );

    const fields = [...document.querySelectorAll('input, select')];

    expect(fields.map(field => field.name)).toEqual([
      'ailab-test-island',
      'ailab-test-mass',
      'ailab-test-bill',
    ]);
  });

  test('a dropdown offers each option after a disabled prompt, and sets its feature', () => {
    const store = levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species');
    renderTestPanel(store);
    const island = screen.getByLabelText('island');

    expect(
      [...island.options].map(option => [option.text, option.disabled]),
    ).toEqual([
      ['Choose one', true],
      ['Biscoe', false],
      ['Dream', false],
      ['Torgersen', false],
    ]);

    fireEvent.change(island, {target: {value: 'Dream'}});

    expect(store.getState().testData.island).toBe('Dream');
    expect(island.value).toBe('Dream');
  });

  test('Random fills every feature, enables Predict, and clears the last prediction', () => {
    const store = levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species');
    store.dispatch(setPrediction('Adelie', []));
    renderTestPanel(store);
    expect(predictButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', {name: 'Random'}));

    expect(Object.keys(store.getState().testData).sort()).toEqual([
      'bill',
      'island',
      'mass',
    ]);
    expect(predictButton().disabled).toBe(false);
    expect(store.getState().prediction).toBeUndefined();
  });

  test('a decision tree lists each step to its prediction', () => {
    const store = trainedAnimalStore({trainer: 'decisionTree'});
    renderTestPanel(store);

    predictSnake();

    expect(
      screen.getByRole('heading', {name: 'AI predicts snake'}),
    ).toBeTruthy();
    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].textContent).toMatch(/^1legs is [<≥] \d/);
    expect(steps[steps.length - 1].textContent).toBe(
      `${steps.length}animal is snake`,
    );
  });

  test('a KNN model shows its prediction without steps', () => {
    const store = trainedAnimalStore(undefined);
    renderTestPanel(store);

    predictSnake();

    expect(
      screen.getByRole('heading', {name: /^AI predicts (bird|dog|snake)$/}),
    ).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});
