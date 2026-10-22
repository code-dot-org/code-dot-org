import {act, renderHook} from '@testing-library/react-hooks';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {useTableView} from '@cdo/apps/ailab/engine/useTableView';

const DATA = [
  {name: 'ant', size: '2', habitat: 'land'},
  {name: 'whale', size: '10', habitat: 'sea'},
  {name: 'crab', size: '9', habitat: 'sea'},
  {name: 'bee', size: '2', habitat: ''},
];

const COLUMN_TYPES = {
  name: ColumnTypes.CATEGORICAL,
  size: ColumnTypes.NUMERICAL,
  habitat: ColumnTypes.CATEGORICAL,
};

const ALL_COLUMNS = Object.keys(COLUMN_TYPES);
const ALL_ROWS = [0, 1, 2, 3];
const valueAt = (row, column) => DATA[row][column];

function renderView(source = {}) {
  return renderHook(props => useTableView(props), {
    initialProps: {
      rows: ALL_ROWS,
      columns: ALL_COLUMNS,
      columnTypes: COLUMN_TYPES,
      filterableColumns: ['name', 'habitat'],
      valueAt,
      ...source,
    },
  });
}

describe('useTableView', () => {
  test('sorts a numerical column by value, then descending, then not', () => {
    const {result} = renderView();

    act(() => result.current.toggleSort('size'));
    expect(result.current.sortDirection('size')).toBe('ascending');
    expect(result.current.rows).toEqual([0, 3, 2, 1]);

    act(() => result.current.toggleSort('size'));
    expect(result.current.sortDirection('size')).toBe('descending');
    expect(result.current.rows).toEqual([1, 2, 0, 3]);

    act(() => result.current.toggleSort('size'));
    expect(result.current.sortDirection('size')).toBeUndefined();
    expect(result.current.rows).toEqual([0, 1, 2, 3]);
  });

  test('sorting another column starts it ascending', () => {
    const {result} = renderView();
    act(() => result.current.toggleSort('size'));
    act(() => result.current.toggleSort('name'));

    expect(result.current.sortDirection('size')).toBeUndefined();
    expect(result.current.sortDirection('name')).toBe('ascending');
    expect(result.current.rows).toEqual([0, 3, 2, 1]);
  });

  test('a blank or a number-led word in a numerical column sorts after every number', () => {
    const data = [{size: '-5'}, {size: '-7 cm'}, {size: ''}, {size: '-10'}];
    const {result} = renderView({
      rows: [0, 1, 2, 3],
      columns: ['size'],
      columnTypes: {size: ColumnTypes.NUMERICAL},
      valueAt: (row, column) => data[row][column],
    });
    act(() => result.current.toggleSort('size'));
    expect(result.current.rows).toEqual([3, 0, 2, 1]);
  });

  test('sorts only the given rows', () => {
    const {result} = renderView({rows: [3, 1, 0]});
    expect(result.current.rows).toEqual([3, 1, 0]);

    act(() => result.current.toggleSort('name'));
    expect(result.current.rows).toEqual([0, 3, 1]);
  });

  test('a hidden column keeps its sort without applying it', () => {
    const {result, rerender} = renderView();
    act(() => result.current.toggleSort('size'));

    const showOnlyName = {
      rows: ALL_ROWS,
      columns: ['name'],
      columnTypes: COLUMN_TYPES,
      filterableColumns: ['name', 'habitat'],
      valueAt,
    };
    rerender(showOnlyName);
    expect(result.current.rows).toEqual([0, 1, 2, 3]);

    rerender({...showOnlyName, columns: ALL_COLUMNS});
    expect(result.current.rows).toEqual([0, 3, 2, 1]);
  });

  test('reads each value once per sort, and not again on a rerender', () => {
    const countedValueAt = jest.fn(valueAt);
    const {result, rerender} = renderView({valueAt: countedValueAt});
    act(() => result.current.toggleSort('name'));
    expect(countedValueAt).toHaveBeenCalledTimes(ALL_ROWS.length);

    rerender();
    expect(countedValueAt).toHaveBeenCalledTimes(ALL_ROWS.length);
  });

  test('keeps the rows whose value is checked in the filtered column', () => {
    const {result} = renderView();

    act(() => result.current.filterBy('habitat', ['sea']));
    expect(result.current.rows).toEqual([1, 2]);
    expect(result.current.filter).toEqual({column: 'habitat', values: ['sea']});
    expect(result.current.totalRows).toBe(4);
  });

  test('filtering another column replaces the filter', () => {
    const {result} = renderView();
    act(() => result.current.filterBy('habitat', ['sea']));
    act(() => result.current.filterBy('name', ['ant', 'crab']));

    expect(result.current.filter.column).toBe('name');
    expect(result.current.rows).toEqual([0, 2]);
  });

  test('unchecking every value or clearing removes the filter', () => {
    const {result} = renderView();
    act(() => result.current.filterBy('habitat', ['sea']));
    act(() => result.current.filterBy('habitat', []));
    expect(result.current.filter).toBeUndefined();
    expect(result.current.rows).toEqual(ALL_ROWS);

    act(() => result.current.filterBy('habitat', ['sea']));
    act(() => result.current.clearFilter());
    expect(result.current.filter).toBeUndefined();
    expect(result.current.rows).toEqual(ALL_ROWS);
  });

  test('sorts only the rows the filter keeps', () => {
    const {result} = renderView();
    act(() => result.current.filterBy('habitat', ['sea']));
    act(() => result.current.toggleSort('size'));

    expect(result.current.rows).toEqual([2, 1]);
  });

  test('toggling the sort does not filter the rows again', () => {
    const countedValueAt = jest.fn(valueAt);
    const {result} = renderView({valueAt: countedValueAt});
    act(() => result.current.filterBy('habitat', ['sea']));
    countedValueAt.mockClear();

    act(() => result.current.toggleSort('name'));
    expect(countedValueAt).toHaveBeenCalledTimes(2);
  });

  test('reads a column once for its filter options until the rows change', () => {
    const countedValueAt = jest.fn(valueAt);
    const {result, rerender} = renderView({valueAt: countedValueAt});
    result.current.filterOptions('habitat');
    result.current.filterOptions('habitat');
    act(() => result.current.toggleSort('size'));
    countedValueAt.mockClear();

    result.current.filterOptions('habitat');
    expect(countedValueAt).not.toHaveBeenCalled();

    rerender({
      rows: [1, 2],
      columns: ALL_COLUMNS,
      columnTypes: COLUMN_TYPES,
      filterableColumns: ['name', 'habitat'],
      valueAt: countedValueAt,
    });
    countedValueAt.mockClear();
    expect(result.current.filterOptions('habitat')).toEqual(['sea']);
    expect(countedValueAt).toHaveBeenCalledTimes(2);
  });

  test('offers sorted, non-blank values for filterable columns only', () => {
    const {result} = renderView();

    expect(result.current.filterableColumns).toEqual(['name', 'habitat']);
    expect(result.current.filterOptions('habitat')).toEqual(['land', 'sea']);
    expect(result.current.filterOptions('name')).toEqual([
      'ant',
      'bee',
      'crab',
      'whale',
    ]);
  });

  test('a checked value stays offered when the rows no longer hold it', () => {
    const {result, rerender} = renderView();
    act(() => result.current.filterBy('name', ['ant']));

    rerender({
      rows: [1, 2],
      columns: ALL_COLUMNS,
      columnTypes: COLUMN_TYPES,
      filterableColumns: ['name', 'habitat'],
      valueAt,
    });
    expect(result.current.rows).toEqual([]);
    expect(result.current.totalRows).toBe(2);
    expect(result.current.filterOptions('name')).toEqual([
      'ant',
      'crab',
      'whale',
    ]);
  });

  test('a hidden column is not offered but keeps applying its filter', () => {
    const {result, rerender} = renderView();
    act(() => result.current.filterBy('habitat', ['sea']));

    rerender({
      rows: ALL_ROWS,
      columns: ['name'],
      columnTypes: COLUMN_TYPES,
      filterableColumns: ['name', 'habitat'],
      valueAt,
    });
    expect(result.current.filterableColumns).toEqual(['name']);
    expect(result.current.rows).toEqual([1, 2]);
  });
});
