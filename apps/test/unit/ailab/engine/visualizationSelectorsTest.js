import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  currentColumnIsNumerical,
  currentColumnIsCategorical,
} from '@cdo/apps/ailab/engine/selectors/currentColumnSelectors';
import {
  getScatterPlotData,
  getCrossTabData,
  labelColumnIsNumerical,
  labelColumnIsCategorical,
  getUniqueOptionsLabelColumn,
} from '@cdo/apps/ailab/engine/selectors/visualizationSelectors';

import {
  allNumericalState,
  allNumericalProject,
  classificationState,
  classificationProject,
} from './testData';

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
      allNumericalProject.labelColumn,
      labelColumnIsNumerical,
      allNumericalState.currentColumn,
      currentColumnIsNumerical,
      allNumericalState.data
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
      classificationProject.labelColumn,
      labelColumnIsCategorical,
      classificationState.currentColumn,
      currentColumnIsCategorical,
      classificationState.data,
      getUniqueOptionsLabelColumn
    );
    expect(crossTabData.labelName).toEqual('play');
    expect(crossTabData.featureNames).toEqual(['temp']);
    expect(crossTabData.results[0]).toEqual(sampleExpectedResult);
  });
});

describe('getting category options', () => {
  test('gets unique options label column', async () => {
    const uniqueOptions = getUniqueOptionsLabelColumn.resultFunc(
      classificationProject.labelColumn,
      classificationState.data
    );
    expect(uniqueOptions).toEqual(['no', 'yes']);
  });
});
