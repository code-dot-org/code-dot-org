import {
  isColumnCategorical,
  isColumnNumerical,
  filterColumnsByType,
  getUniqueOptions,
  tooManyUniqueOptions,
  isColumnReadOnly,
  getExtrema,
  containsOnlyNumbers,
  getColumnDescription
} from '../../src/helpers/columnDetails.js';
import {
  classificationState,
  allNumericalState,
  regressionState,
  premadeDatasetState,
  mosquitoCountMax,
  mosquitoCountMin,
  mosquitoDescription,
  premadeDatasetTranslations
} from './testData';
import { ColumnTypes, UNIQUE_OPTIONS_MAX } from "../../src/constants.js";
import I18n from "../../src/i18n";

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

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

describe("filter columns by datatype", () => {
  test("filter numerical columns", async () => {
    const result = filterColumnsByType(
      regressionState.columnsByDataType,
      ColumnTypes.NUMERICAL
    )
    expect(result).toEqual(['height']);
  });

  test("filter categorical columns", async () => {
    const result = filterColumnsByType(
      regressionState.columnsByDataType,
      ColumnTypes.CATEGORICAL
    )
    expect(result).toEqual(['sun']);
  });
});

describe("unique options", () => {
  const uniqueOptions = getUniqueOptions(classificationState.data, 'temp')
    .sort();

  test("get unique options", async () => {
    expect(uniqueOptions).toEqual(['cool', 'hot', 'mild']);
  });

  test("not too many unique options", async () => {
    const uniqueOptionsCount = uniqueOptions.length;
    const result = tooManyUniqueOptions(uniqueOptionsCount);
    expect(result).toBe(false);
  });

  test("too many unique options", async () => {
    const result = tooManyUniqueOptions(UNIQUE_OPTIONS_MAX + 1);
    expect(result).toBe(true);
  });
});

describe("isColumnReadOnly", () => {
  test("column is readOnly", async () => {
    const result = isColumnReadOnly(premadeDatasetState.metadata, 'batCount');
    expect(result).toBe(true);
  });

  test("column is not readOnly", async () => {
    const result = isColumnReadOnly(allNumericalState.metadata, 'batCount');
    expect(result).toBe(false);
  });
});

describe("extrema", () => {
  test("getExtrema", async () => {
    const result = getExtrema(allNumericalState.data, 'mosquitoCount');
    expect(result.max).toBe(mosquitoCountMax);
    expect(result.min).toBe(mosquitoCountMin);
    expect(result.range).toBe(mosquitoCountMax - mosquitoCountMin);
  });
});

describe("containsOnlyNumbers", () => {
  test("contains only numbers", async () => {
    const result = containsOnlyNumbers(allNumericalState.data, 'mosquitoCount');
    expect(result).toBe(true);
  });

  test("contains a string", async () => {
    const result = containsOnlyNumbers(classificationState.data, 'play');
    expect(result).toBe(false);
  });
});

describe("getColumnDescription", () => {
  test("gets description from metadata", async () => {
    const result = getColumnDescription(
      'mosquitoCount',
      premadeDatasetState.metadata,
      {}
    );
    expect(result).toEqual(mosquitoDescription);
  });

  test("gets localized description", async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    const result = getColumnDescription(
      "mosquitoCount",
      premadeDatasetState.metadata,
      {});
    expect(result).toEqual("mosquitoCount description");
  });

  test("no description", async () => {
    const result = getColumnDescription('play', {}, {});
    expect(result).toEqual(null);
  });
});
