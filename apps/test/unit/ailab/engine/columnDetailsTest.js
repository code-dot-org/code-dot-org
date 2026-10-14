import {
  ColumnTypes,
  UNIQUE_OPTIONS_MAX,
} from '@cdo/apps/ailab/engine/constants';
import {
  isColumnCategorical,
  isColumnNumerical,
  filterColumnsByType,
  getUniqueOptions,
  getLocalizedColumnName,
  tooManyUniqueOptions,
  isColumnReadOnly,
  getExtrema,
  getDecimalPlaces,
  containsOnlyNumbers,
  getColumnDescription,
  getMostAndLeastCommon,
} from '@cdo/apps/ailab/engine/helpers/columnDetails';
import I18n from '@cdo/apps/ailab/engine/i18n';

import {
  classificationState,
  allNumericalState,
  regressionState,
  premadeDatasetState,
  premadeDatasetColumnNameLocalized,
  mosquitoCountMax,
  mosquitoCountMin,
  mosquitoDescription,
  premadeDatasetTranslations,
} from './testData';

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

describe('column data types', () => {
  test('column is categorical', async () => {
    const result = isColumnCategorical(classificationState, 'play');
    expect(result).toBe(true);
  });

  test('column is not categorical', async () => {
    const result = isColumnCategorical(allNumericalState, 'batCount');
    expect(result).toBe(false);
  });

  test('column is numerical', async () => {
    const result = isColumnNumerical(allNumericalState, 'batCount');
    expect(result).toBe(true);
  });

  test('column is not numerical', async () => {
    const result = isColumnNumerical(classificationState, 'play');
    expect(result).toBe(false);
  });
});

describe('filter columns by datatype', () => {
  test('filter numerical columns', async () => {
    const result = filterColumnsByType(
      regressionState.columnsByDataType,
      ColumnTypes.NUMERICAL
    );
    expect(result).toEqual(['height']);
  });

  test('filter categorical columns', async () => {
    const result = filterColumnsByType(
      regressionState.columnsByDataType,
      ColumnTypes.CATEGORICAL
    );
    expect(result).toEqual(['sun']);
  });
});

describe('unique options', () => {
  const uniqueOptions = getUniqueOptions(
    classificationState.data,
    'temp'
  ).sort();

  test('get unique options', async () => {
    expect(uniqueOptions).toEqual(['cool', 'hot', 'mild']);
  });

  test('not too many unique options', async () => {
    const uniqueOptionsCount = uniqueOptions.length;
    const result = tooManyUniqueOptions(uniqueOptionsCount);
    expect(result).toBe(false);
  });

  test('too many unique options', async () => {
    const result = tooManyUniqueOptions(UNIQUE_OPTIONS_MAX + 1);
    expect(result).toBe(true);
  });
});

describe('isColumnReadOnly', () => {
  test('column is readOnly', async () => {
    const result = isColumnReadOnly(premadeDatasetState.metadata, 'batCount');
    expect(result).toBe(true);
  });

  test('column is not readOnly', async () => {
    const result = isColumnReadOnly(allNumericalState.metadata, 'batCount');
    expect(result).toBe(false);
  });
});

describe('extrema', () => {
  test('getExtrema', async () => {
    const result = getExtrema(allNumericalState.data, 'mosquitoCount');
    expect(result.max).toBe(mosquitoCountMax);
    expect(result.min).toBe(mosquitoCountMin);
    expect(result.range).toBe(mosquitoCountMax - mosquitoCountMin);
  });
});

describe('getDecimalPlaces', () => {
  const column = cells => cells.map(x => ({x}));

  test('takes the precision of the most precise cells', () => {
    expect(getDecimalPlaces(column(['3750', '39.1', '46.25']), 'x')).toBe(2);
  });

  test('reads scientific notation', () => {
    expect(getDecimalPlaces(column(['1.2E-5']), 'x')).toBe(6);
    expect(getDecimalPlaces(column(['2e-5']), 'x')).toBe(5);
    expect(getDecimalPlaces(column(['1.23E+11']), 'x')).toBe(0);
  });
});

describe('containsOnlyNumbers', () => {
  test('contains only numbers', async () => {
    const result = containsOnlyNumbers(allNumericalState.data, 'mosquitoCount');
    expect(result).toBe(true);
  });

  test('contains a string', async () => {
    const result = containsOnlyNumbers(classificationState.data, 'play');
    expect(result).toBe(false);
  });
});

describe('getColumnDescription', () => {
  test('gets description from metadata', async () => {
    const result = getColumnDescription(
      'mosquitoCount',
      premadeDatasetState.metadata,
      {}
    );
    expect(result).toEqual(mosquitoDescription);
  });

  test('gets localized description', async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    const result = getColumnDescription(
      'mosquitoCount',
      premadeDatasetState.metadata,
      {}
    );
    expect(result).toEqual('mosquitoCount description');
  });

  test('no description', async () => {
    const result = getColumnDescription('play', {}, {});
    expect(result).toEqual(null);
  });
});

describe('getLocalizedColumnName', () => {
  test('returns the fallback column name', async () => {
    const result = getLocalizedColumnName('dataset-id', 'column-id');
    expect(result).toEqual('column-id');
  });

  test('returns the localized column name', async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    const result = getLocalizedColumnName('bats_eat_mozzies', 'mosquitoCount');
    expect(result).toEqual(premadeDatasetColumnNameLocalized);
  });
});

describe('getMostAndLeastCommon', () => {
  test('finds the most and least frequent options', () => {
    const result = getMostAndLeastCommon(['hot', 'medium', 'mild'], {
      hot: 16,
      medium: 1,
      mild: 18,
    });
    expect(result).toEqual({mostCommon: 'mild', leastCommon: 'medium'});
  });

  test('breaks ties by option order', () => {
    const result = getMostAndLeastCommon(['a', 'b'], {a: 2, b: 2});
    expect(result).toEqual({mostCommon: 'a', leastCommon: 'a'});
  });

  test('returns undefined when there are no options', () => {
    expect(getMostAndLeastCommon([], {})).toBeUndefined();
  });
});
