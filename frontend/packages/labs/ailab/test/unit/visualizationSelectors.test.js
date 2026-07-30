import I18n from '../../src/i18n';
import {
  currentColumnIsNumerical,
  currentColumnIsCategorical,
} from '../../src/selectors/currentColumnSelectors';
import {
  getScatterPlotData,
  getCrossTabData,
  getMixedRelationshipPlotData,
  labelColumnIsNumerical,
  labelColumnIsCategorical,
  getUniqueOptionsLabelColumn,
} from '../../src/selectors/visualizationSelectors';

import {allNumericalState, classificationState, regressionState} from './testData';

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

describe('getScatterPlotData', () => {
  const expected = {
    label: 'mosquitoCount',
    feature: 'batCount',
    coordinates: [
      {x: 100, y: 1},
      {x: 90, y: 2},
      {x: 80, y: 3},
      {x: 70, y: 4},
      {x: 60, y: 5},
      {x: 50, y: 6},
      {x: 40, y: 10},
    ],
  };
  test('gets scatter plot data', async () => {
    const scatterPlotData = getScatterPlotData.resultFunc(
      allNumericalState.labelColumn,
      labelColumnIsNumerical,
      allNumericalState.currentColumn,
      currentColumnIsNumerical,
      allNumericalState.data,
    );
    expect(expected).toEqual(scatterPlotData);
  });
});

describe('getCrossTabData', () => {
  test('gets cross tab data', async () => {
    const sampleExpectedResult = {
      featureValues: ['hot'],
      labelCounts: {no: 1, yes: 1},
      labelPercents: {no: 50, yes: 50},
    };
    const crossTabData = getCrossTabData.resultFunc(
      classificationState.labelColumn,
      labelColumnIsCategorical,
      classificationState.currentColumn,
      currentColumnIsCategorical,
      classificationState.data,
      getUniqueOptionsLabelColumn,
    );
    expect(crossTabData.labelName).toEqual('play');
    expect(crossTabData.featureNames).toEqual(['temp']);
    expect(crossTabData.results[0]).toEqual(sampleExpectedResult);
  });
});

describe('getMixedRelationshipPlotData', () => {
  test('gets categorical feature and numerical label data', async () => {
    const mixedRelationshipPlotData = getMixedRelationshipPlotData.resultFunc(
      regressionState.labelColumn,
      true,
      false,
      'sun',
      false,
      true,
      regressionState.data,
    );

    expect(mixedRelationshipPlotData.xAxisLabel).toEqual('sun');
    expect(mixedRelationshipPlotData.yAxisLabel).toEqual('height');
    expect(mixedRelationshipPlotData.xCategories).toEqual([
      'high',
      'low',
      'medium',
    ]);
    expect(mixedRelationshipPlotData.coordinates).toEqual([
      {x: -0.08, y: 3.8},
      {x: -0.04, y: 3.9},
      {x: 2, y: 2.6},
      {x: 2.04, y: 2.5},
      {x: 1.08, y: 0.9},
      {x: 0.92, y: 1.6},
    ]);
  });

  test('gets numerical feature and categorical label data', async () => {
    const mixedRelationshipPlotData = getMixedRelationshipPlotData.resultFunc(
      'pet',
      false,
      true,
      'age',
      true,
      false,
      [
        {age: 10, pet: 'cat'},
        {age: 12, pet: 'dog'},
        {age: 13, pet: 'cat'},
      ],
    );

    expect(mixedRelationshipPlotData.xAxisLabel).toEqual('pet');
    expect(mixedRelationshipPlotData.yAxisLabel).toEqual('age');
    expect(mixedRelationshipPlotData.xCategories).toEqual(['cat', 'dog']);
    expect(mixedRelationshipPlotData.coordinates).toEqual([
      {x: -0.08, y: 10},
      {x: 0.96, y: 12},
      {x: 0, y: 13},
    ]);
  });

  test('returns null for same-type columns', async () => {
    const mixedRelationshipPlotData = getMixedRelationshipPlotData.resultFunc(
      allNumericalState.labelColumn,
      true,
      false,
      allNumericalState.currentColumn,
      true,
      false,
      allNumericalState.data,
    );

    expect(mixedRelationshipPlotData).toBeNull();
  });
});

describe('getting category options', () => {
  test('gets unique options label column', async () => {
    const uniqueOptions = getUniqueOptionsLabelColumn.resultFunc(
      classificationState.labelColumn,
      classificationState.data,
    );
    expect(uniqueOptions).toEqual(['no', 'yes']);
  });
});
