import {
  getCategoricalColumns,
  getSelectedCategoricalColumns,
  getSelectedCategoricalFeatures,
  getNumericalColumns,
  getSelectedNumericalColumns,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
  getUniqueOptionsLabelColumn,
  getUniqueOptionsCurrentColumn,
  getExtremaByColumn,
  getExtremaCurrentColumn,
  getOptionFrequenciesCurrentColumn
} from "../../src/selectors";
import { classificationState, allNumericalState } from "./testData";

describe("selecting columns by data type", () => {
  test("gets selected categorical features", async () => {
    const categoricalColumns = getCategoricalColumns
      .resultFunc(classificationState.columnsByDataType).sort();
    expect(categoricalColumns).toEqual(['play', 'temp', 'weather']);
    const result = getSelectedCategoricalFeatures.resultFunc(
      categoricalColumns, classificationState.selectedFeatures
    )
    expect(result).toEqual(['temp', 'weather']);
  });

  test("gets selected numerical features", async () => {
    const numericalColumns = getNumericalColumns
      .resultFunc(allNumericalState.columnsByDataType);
    expect(numericalColumns).toEqual(['batCount', 'mosquitoCount']);
    const result = getSelectedNumericalFeatures.resultFunc(
      numericalColumns, allNumericalState.selectedFeatures
    )
    expect(result).toEqual(['batCount']);
  });
});

describe("getting category options", () => {
  test("gets unique options by column", async () => {
    const categoricalColumns = getCategoricalColumns
      .resultFunc(classificationState.columnsByDataType).sort();
    const selectedCategoricalColumns =
      getSelectedCategoricalColumns.resultFunc(
        categoricalColumns,
        classificationState.selectedFeatures,
        classificationState.labelColumn
      )
    const uniqueOptionsByColumn =
      getUniqueOptionsByColumn.resultFunc(
        selectedCategoricalColumns,
        classificationState.data
      )
    expect(uniqueOptionsByColumn['play']).toEqual(['no', 'yes']);
    expect(uniqueOptionsByColumn['temp']).toEqual(['cool', 'hot', 'mild']);
    expect(uniqueOptionsByColumn['weather']).toEqual(
      ['overcast', 'rainy', 'sunny']
    );
  });

  test("gets unique options label column", async () => {
    const uniqueOptions = getUniqueOptionsLabelColumn.resultFunc(
      classificationState.labelColumn,
      classificationState.data
    )
    expect(uniqueOptions).toEqual(['no', 'yes']);
  });

  test("gets unique options current column", async () => {
    const uniqueOptions = getUniqueOptionsCurrentColumn.resultFunc(
      classificationState.currentColumn,
      classificationState.data
    )
    expect(uniqueOptions).toEqual(['cool', 'hot', 'mild']);
  });

  test("gets option frequencies current column", async () => {
    const optionFrequencies = getOptionFrequenciesCurrentColumn.resultFunc(
      classificationState.currentColumn,
      classificationState.data
    )
    expect(optionFrequencies).toEqual({ hot: 2, mild: 2, cool: 2 });
  });

});

describe("getting extrema", () => {
  test("gets extrema by column", async () => {
    const numericalColumns = getNumericalColumns
      .resultFunc(allNumericalState.columnsByDataType);
    const selectedNumericalColumns =  getSelectedNumericalColumns.resultFunc(
      numericalColumns,
      allNumericalState.selectedFeatures,
      allNumericalState.labelColumn
    )
    const extremaByColumn =
      getExtremaByColumn.resultFunc(
        selectedNumericalColumns,
        allNumericalState.data
      )
    expect(extremaByColumn['batCount'].max).toBe(100);
    expect(extremaByColumn['batCount'].min).toBe(40);
    expect(extremaByColumn['batCount'].range).toBe(60);
    expect(extremaByColumn['mosquitoCount'].max).toBe(10);
    expect(extremaByColumn['mosquitoCount'].min).toBe(1);
    expect(extremaByColumn['mosquitoCount'].range).toBe(9);
  });

  test("gets extrema current column", async () => {
    const extrema = getExtremaCurrentColumn.resultFunc(
      allNumericalState.currentColumn,
      allNumericalState.data
    )
    expect(extrema.max).toBe(100);
    expect(extrema.min).toBe(40);
    expect(extrema.range).toBe(60);
  });
});
