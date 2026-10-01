import {ColumnTypes} from '../../src/constants';
import {getRandomTestData} from '../../src/helpers/randomTestData';

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

function randomTestDataWhenRandomIs(value) {
  vi.spyOn(Math, 'random').mockReturnValue(value);
  const store = levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species');
  return getRandomTestData(store.getState());
}

describe('getRandomTestData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('fills every feature and not the label', () => {
    expect(Object.keys(randomTestDataWhenRandomIs(0.5)).sort()).toEqual([
      'bill',
      'island',
      'mass',
    ]);
  });

  test('can reach the minimum, the maximum, and the first and last option', () => {
    expect(randomTestDataWhenRandomIs(0)).toEqual({
      island: 'Biscoe',
      mass: '3500',
      bill: '39.10',
    });
    expect(randomTestDataWhenRandomIs(0.9999)).toEqual({
      island: 'Torgersen',
      mass: '5000',
      bill: '49.30',
    });
  });

  test('draws numbers between the extremes that no row holds', () => {
    expect(randomTestDataWhenRandomIs(0.5)).toEqual({
      island: 'Dream',
      mass: '4250',
      bill: '44.20',
    });
  });
});
