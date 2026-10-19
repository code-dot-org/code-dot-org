/*
  Sorting for the data tables. A sort on a column not in `columns` is kept but
  not applied, so it returns when that column is shown.
*/

import {useCallback, useMemo, useState} from 'react';

import {ColumnTypes} from './constants';
import type {DataRow} from './types';

export type SortDirection = 'ascending' | 'descending';

// A column from outside the dataset takes a symbol, which no column name can match.
export type ColumnId = string | symbol;

interface TableSort {
  column: ColumnId;
  direction: SortDirection;
}

export interface TableView {
  rows: number[];
  isNumerical: (column: ColumnId) => boolean;
  sortDirection: (column: ColumnId) => SortDirection | undefined;
  toggleSort: (column: ColumnId) => void;
}

interface TableViewSource {
  rows: number[];
  columns: ColumnId[];
  columnTypes: Partial<Record<ColumnId, string>>;
  // Keep it stable across renders, or every render sorts again.
  valueAt: (row: number, column: ColumnId) => string | number;
}

const collator = new Intl.Collator('en', {numeric: true});

// Uploaded CSV values are strings, and a numerical column may hold a stray word.
function compareValues(
  a: string | number,
  b: string | number,
  numerical: boolean
): number {
  if (numerical) {
    const difference = Number(a) - Number(b);
    if (!Number.isNaN(difference)) {
      return difference;
    }
  }
  return collator.compare(String(a), String(b));
}

// Unsorted, then ascending, then descending, then unsorted again.
export function nextSortDirection(
  direction: SortDirection | undefined
): SortDirection | undefined {
  if (!direction) {
    return 'ascending';
  }
  return direction === 'ascending' ? 'descending' : undefined;
}

// For a table whose columns all come from the dataset.
export function useDatasetValueAt(data: DataRow[]) {
  return useCallback(
    (row: number, column: ColumnId) => data[row][column as string],
    [data]
  );
}

export function useTableView({
  rows,
  columns,
  columnTypes,
  valueAt,
}: TableViewSource): TableView {
  const [sort, setSort] = useState<TableSort>();

  const sortedRows = useMemo(() => {
    if (!sort || !columns.includes(sort.column)) {
      return rows;
    }
    const {column, direction} = sort;
    const numerical = columnTypes[column] === ColumnTypes.NUMERICAL;
    const sign = direction === 'ascending' ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        sign * compareValues(valueAt(a, column), valueAt(b, column), numerical)
    );
  }, [rows, columns, columnTypes, valueAt, sort]);

  return {
    rows: sortedRows,
    isNumerical: column => columnTypes[column] === ColumnTypes.NUMERICAL,
    sortDirection: column =>
      sort?.column === column ? sort.direction : undefined,
    toggleSort: column =>
      setSort(current => {
        const direction = nextSortDirection(
          current?.column === column ? current.direction : undefined
        );
        return direction && {column, direction};
      }),
  };
}
