import {ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import {ColumnTypes} from '../../src/constants';
import I18n from '../../src/i18n';
import {setPrediction} from '../../src/redux';
import Predict from '../../src/UIComponents/Predict';

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

describe('Predict', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('Randomize fills every feature, enables Predict, and clears the last prediction', () => {
    const store = levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species');
    store.dispatch(setPrediction('Adelie', []));
    render(
      createElement(
        Provider,
        {store},
        createElement(
          ThemeProvider,
          {theme: getMuiThemeForBrand(undefined)},
          createElement(Predict),
        ),
      ),
    );
    const predictButton = screen.getByRole('button', {
      name: I18n.t('predictButton'),
    });
    expect(predictButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', {name: 'Randomize'}));

    expect(Object.keys(store.getState().testData).sort()).toEqual([
      'bill',
      'island',
      'mass',
    ]);
    expect(predictButton.disabled).toBe(false);
    expect(store.getState().prediction).toBeUndefined();
  });
});
