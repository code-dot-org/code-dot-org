import {
  isColumnCategorical,
  isColumnNumerical
} from '../../src/helpers/columnDetails.js';
import { classificationState, allNumericalState } from './testData';

describe("column data types", () => {
  test("column is categorical", async () => {
    const result = isColumnCategorical(classificationState, 'play');
    expect(result).toBe(true);
  });

  test("column is not categorical", async () => {
    const result = isColumnCategorical(allNumericalState, 'batCount');
    expect(result).toBe(false);
  });

  test("column is numerical", async () => {
    const result = isColumnNumerical(allNumericalState, 'batCount');
    expect(result).toBe(true);
  });
  test("column is not numerical", async () => {
    const result = isColumnNumerical(classificationState, 'play');
    expect(result).toBe(false);
  });
});
