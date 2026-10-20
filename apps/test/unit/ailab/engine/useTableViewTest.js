import {act, renderHook} from '@testing-library/react-hooks';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {useTableView} from '@cdo/apps/ailab/engine/useTableView';

const DATA = [
  {name: 'ant', size: '2'},
  {name: 'whale', size: '10'},
  {name: 'crab', size: '9'},
  {name: 'bee', size: '2'},
];

const COLUMN_TYPES = {
  name: ColumnTypes.CATEGORICAL,
  size: ColumnTypes.NUMERICAL,
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
      valueAt,
    };
    rerender(showOnlyName);
    expect(result.current.rows).toEqual([0, 1, 2, 3]);

    rerender({...showOnlyName, columns: ALL_COLUMNS});
    expect(result.current.rows).toEqual([0, 3, 2, 1]);
  });
});
