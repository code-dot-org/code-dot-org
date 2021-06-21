import { getCategoricalColumns, getSelectedCategoricalFeatures } from "../../src/selectors";
import { classificationState } from "./testData";

describe("getSelectedCategoricalFeatures", () => {
  test("gets selected categorical features", async () => {
    const categoricalColumns = getCategoricalColumns
      .resultFunc(classificationState.columnsByDataType).sort();
    expect(categoricalColumns).toEqual(['play', 'temp', 'weather']);
    const result = getSelectedCategoricalFeatures.resultFunc(
      categoricalColumns, classificationState.selectedFeatures
    )
    expect(result).toEqual(['temp', 'weather']);
  });
});
