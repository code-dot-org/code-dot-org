import {
  getScatterPlotData,
  getCrossTabData,
  labelColumnIsNumerical,
  // labelColumnIsCategorical,
  getUniqueOptionsLabelColumn
} from '../../src/selectors/visualizationSelectors';
import {
  currentColumnIsNumerical
} from '../../src/selectors/currentColumnSelectors';
import { allNumericalState, classificationState } from './testData';

describe("getScatterPlotData", () => {
  const expected = {
    label: 'mosquitoCount',
    feature: 'batCount',
    coordinates: [
      { x: 100, y: 1 },
      { x: 90, y: 2 },
      { x: 80, y: 3 },
      { x: 70, y: 4 },
      { x: 60, y: 5 },
      { x: 50, y: 6 },
      { x: 40, y: 10 }
    ]
  }
  test("gets scatter plot data", async () => {
    const scatterPlotData = getScatterPlotData.resultFunc(
      allNumericalState.labelColumn,
      labelColumnIsNumerical,
      allNumericalState.currentColumn,
      currentColumnIsNumerical,
      allNumericalState.data
    )
    expect(expected).toEqual(scatterPlotData);
  });
});

describe("getting category options", () => {
  test("gets unique options label column", async () => {
    const uniqueOptions = getUniqueOptionsLabelColumn.resultFunc(
      classificationState.labelColumn,
      classificationState.data
    )
    expect(uniqueOptions).toEqual(['no', 'yes']);
  });
});
