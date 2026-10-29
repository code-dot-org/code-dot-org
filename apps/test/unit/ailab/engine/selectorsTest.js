import {
  ColumnTypes,
  UNIQUE_OPTIONS_MAX,
} from '@cdo/apps/ailab/engine/constants';
import {
  getSelectedColumns,
  getCategoricalColumns,
  getSelectedCategoricalColumns,
  getSelectedCategoricalFeatures,
  getNumericalColumns,
  getSelectedNumericalColumns,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
  getExtremaByColumn,
  getSelectableColumns,
  getFilterableColumns,
  getColumnsByDataType,
  getData,
  getIdColumn,
  getMetadata,
  getTrainableColumns,
} from '@cdo/apps/ailab/engine/selectors';

import {
  classificationRows,
  classificationColumnTypes,
  classificationProject,
  allNumericalRows,
  allNumericalColumnTypes,
  allNumericalProject,
} from './testData';

describe('selecting columns by data type', () => {
  test('gets selected categorical features', async () => {
    const categoricalColumns = getCategoricalColumns
      .resultFunc(classificationColumnTypes)
      .sort();
    expect(categoricalColumns).toEqual(['play', 'temp', 'weather']);
    const result = getSelectedCategoricalFeatures.resultFunc(
      categoricalColumns,
      classificationProject.selectedFeatures
    );
    expect(result).toEqual(['temp', 'weather']);
  });

  test('gets selected numerical features', async () => {
    const numericalColumns = getNumericalColumns.resultFunc(
      allNumericalColumnTypes
    );
    expect(numericalColumns).toEqual(['batCount', 'mosquitoCount']);
    const result = getSelectedNumericalFeatures.resultFunc(
      numericalColumns,
      allNumericalProject.selectedFeatures
    );
    expect(result).toEqual(['batCount']);
  });
});

describe('getting category options', () => {
  test('gets unique options by column', async () => {
    const categoricalColumns = getCategoricalColumns
      .resultFunc(classificationColumnTypes)
      .sort();
    const selectedColumns = getSelectedColumns.resultFunc(
      classificationProject.selectedFeatures,
      classificationProject.labelColumn
    );
    const selectedCategoricalColumns = getSelectedCategoricalColumns.resultFunc(
      categoricalColumns,
      selectedColumns
    );
    const uniqueOptionsByColumn = getUniqueOptionsByColumn.resultFunc(
      selectedCategoricalColumns,
      classificationRows
    );
    expect(uniqueOptionsByColumn['play']).toEqual(['no', 'yes']);
    expect(uniqueOptionsByColumn['temp']).toEqual(['cool', 'hot', 'mild']);
    expect(uniqueOptionsByColumn['weather']).toEqual([
      'overcast',
      'rainy',
      'sunny',
    ]);
  });
});

describe('getting extrema', () => {
  test('gets extrema by column', async () => {
    const numericalColumns = getNumericalColumns.resultFunc(
      allNumericalColumnTypes
    );
    const selectedColumns = getSelectedColumns.resultFunc(
      allNumericalProject.selectedFeatures,
      allNumericalProject.labelColumn
    );
    const selectedNumericalColumns = getSelectedNumericalColumns.resultFunc(
      numericalColumns,
      selectedColumns
    );
    const extremaByColumn = getExtremaByColumn.resultFunc(
      selectedNumericalColumns,
      allNumericalRows
    );
    expect(extremaByColumn['batCount'].max).toBe(100);
    expect(extremaByColumn['batCount'].min).toBe(40);
    expect(extremaByColumn['batCount'].range).toBe(60);
    expect(extremaByColumn['mosquitoCount'].max).toBe(10);
    expect(extremaByColumn['mosquitoCount'].min).toBe(1);
    expect(extremaByColumn['mosquitoCount'].range).toBe(9);
  });
});

describe('getTrainableColumns', () => {
  const tooManyOptions = Array.from({length: UNIQUE_OPTIONS_MAX + 1}, (_, i) =>
    String(i)
  );
  const data = tooManyOptions.map((id, index) => ({
    count: String(index),
    mixed: index === 0 ? 'n/a' : String(index),
    color: index % 2 ? 'red' : 'blue',
    id,
    untyped: 'x',
  }));
  const columnsByDataType = {
    count: ColumnTypes.NUMERICAL,
    mixed: ColumnTypes.NUMERICAL,
    color: ColumnTypes.CATEGORICAL,
    id: ColumnTypes.CATEGORICAL,
  };

  test('keeps numbers-only numerical and small categorical columns', () => {
    expect(getTrainableColumns.resultFunc(data, columnsByDataType)).toEqual([
      'count',
      'color',
    ]);
  });

  test('returns nothing when there is no data', () => {
    expect(getTrainableColumns.resultFunc([], columnsByDataType)).toEqual([]);
  });
});

describe('getSelectableColumns', () => {
  test('leaves out the id column', () => {
    expect(
      getSelectableColumns.resultFunc(['count', 'color'], 'color')
    ).toEqual(['count']);
  });
});

describe('getIdColumn', () => {
  const data = [{name: 'Fido', legs: '4'}];

  test("is the mode's id column when the dataset has it", () => {
    expect(getIdColumn.resultFunc(data, 'name')).toBe('name');
  });

  test('is undefined when the dataset lacks it or the mode sets none', () => {
    expect(getIdColumn.resultFunc(data, 'nope')).toBeUndefined();
    expect(getIdColumn.resultFunc([], 'name')).toBeUndefined();
    expect(getIdColumn.resultFunc(data, undefined)).toBeUndefined();
  });

  test("falls back to the dataset's default when the mode sets none", () => {
    expect(getIdColumn.resultFunc(data, undefined, 'name')).toBe('name');
    expect(getIdColumn.resultFunc(data, 'legs', 'name')).toBe('legs');
  });

  test('is undefined when the mode turns off the default', () => {
    expect(getIdColumn.resultFunc(data, null, 'name')).toBeUndefined();
  });

  test('ignores names inherited by every object', () => {
    expect(getIdColumn.resultFunc(data, 'constructor')).toBeUndefined();
  });
});

describe('getFilterableColumns', () => {
  test('keeps the selectable columns that are categorical', () => {
    expect(
      getFilterableColumns.resultFunc(['count', 'color'], ['color', 'id'])
    ).toEqual(['color']);
  });
});

describe('reading a dataset that has not loaded', () => {
  const empty = {dataset: undefined};

  test('gives the same rows, column types and metadata each time', () => {
    expect(getData(empty)).toBe(getData(empty));
    expect(getColumnsByDataType(empty)).toBe(getColumnsByDataType(empty));
    expect(getMetadata(empty)).toBe(getMetadata(empty));
  });

  test('leaves the selectors built on them memoized', () => {
    getSelectableColumns(empty);
    const computations = getSelectableColumns.recomputations();

    getSelectableColumns({...empty, currentColumn: 'something else'});

    expect(getSelectableColumns.recomputations()).toBe(computations);
  });
});
