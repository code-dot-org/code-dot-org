import {getRandomPredictInputs} from '@cdo/apps/ailab/engine/helpers/randomPredictInputs';

const PENGUIN_COLUMNS = {
  numericalFeatures: ['mass', 'bill'],
  categoricalFeatures: ['island'],
  extremaByColumn: {
    mass: {min: 3500, max: 5000},
    bill: {min: 39.1, max: 49.3},
  },
  decimalPlacesByColumn: {mass: 0, bill: 2},
  uniqueOptionsByColumn: {island: ['Biscoe', 'Dream', 'Torgersen']},
};

function randomPredictInputsWhenRandomIs(value) {
  jest.spyOn(Math, 'random').mockReturnValue(value);
  return getRandomPredictInputs(PENGUIN_COLUMNS);
}

describe('getRandomPredictInputs', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('can reach the minimum, the maximum, and the first and last option', () => {
    expect(randomPredictInputsWhenRandomIs(0)).toEqual({
      island: 'Biscoe',
      mass: '3500',
      bill: '39.10',
    });
    expect(randomPredictInputsWhenRandomIs(0.9999)).toEqual({
      island: 'Torgersen',
      mass: '5000',
      bill: '49.30',
    });
  });

  test('draws numbers between the extremes that no row holds', () => {
    expect(randomPredictInputsWhenRandomIs(0.5)).toEqual({
      island: 'Dream',
      mass: '4250',
      bill: '44.20',
    });
  });
});
