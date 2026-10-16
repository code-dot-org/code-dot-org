import {ColumnTypes, UNIQUE_OPTIONS_MAX} from '../../src/constants';
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
} from '../../src/selectors';

import {
  classificationState,
  classificationProject,
  allNumericalState,
  allNumericalProject,
} from './testData';

describe('selecting columns by data type', () => {
  test('gets selected categorical features', async () => {
    const categoricalColumns = getCategoricalColumns
      .resultFunc(classificationState.columnsByDataType)
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
      allNumericalState.columnsByDataType
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
      .resultFunc(classificationState.columnsByDataType)
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
      classificationState.data
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
      allNumericalState.columnsByDataType
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
      allNumericalState.data
    );
    expect(extremaByColumn['batCount'].max).toBe(100);
    expect(extremaByColumn['batCount'].min).toBe(40);
    expect(extremaByColumn['batCount'].range).toBe(60);
    expect(extremaByColumn['mosquitoCount'].max).toBe(10);
    expect(extremaByColumn['mosquitoCount'].min).toBe(1);
    expect(extremaByColumn['mosquitoCount'].range).toBe(9);
  });
});

describe('getSelectableColumns', () => {
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
    expect(getSelectableColumns.resultFunc(data, columnsByDataType)).toEqual([
      'count',
      'color',
    ]);
  });

  test('returns nothing when there is no data', () => {
    expect(getSelectableColumns.resultFunc([], columnsByDataType)).toEqual([]);
  });
});
