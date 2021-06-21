import {
  getCategoricalColumns,
  getSelectedCategoricalFeatures,
  getNumericalColumns,
  getSelectedNumericalFeatures
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
