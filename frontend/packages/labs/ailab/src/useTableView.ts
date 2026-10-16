/*
  Sorting for the data tables. A sort on a column not in `columns` is kept but
  not applied, so it returns when that column is shown.
*/

import {useMemo, useState} from 'react';

import {ColumnTypes} from './constants';
import type {DataRow} from './types';

export type SortDirection = 'ascending' | 'descending';

interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface TableView {
  rows: number[];
  sortDirection: (column: string) => SortDirection | undefined;
  toggleSort: (column: string) => void;
}

interface TableViewSource {
  data: DataRow[];
  columns: string[];
  columnTypes: Record<string, string>;
  // Defaults to every row of `data`.
  rows?: number[];
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

export function useTableView({
  data,
  columns,
  columnTypes,
  rows: sourceRows,
}: TableViewSource): TableView {
  const [sort, setSort] = useState<TableSort>();

  const allRows = useMemo(
    () => sourceRows ?? [...data.keys()],
    [data, sourceRows]
  );

  const rows = useMemo(() => {
    if (!sort || !columns.includes(sort.column)) {
      return allRows;
    }
    const {column, direction} = sort;
    const numerical = columnTypes[column] === ColumnTypes.NUMERICAL;
    const sign = direction === 'ascending' ? 1 : -1;
    return [...allRows].sort(
      (a, b) =>
        sign * compareValues(data[a][column], data[b][column], numerical)
    );
  }, [data, allRows, columns, columnTypes, sort]);

  return {
    rows,
    sortDirection: column =>
      sort?.column === column ? sort.direction : undefined,
    toggleSort: column =>
      setSort(current => {
        if (current?.column !== column) {
          return {column, direction: 'ascending'};
        }
        if (current.direction === 'ascending') {
          return {column, direction: 'descending'};
        }
        return undefined;
      }),
  };
}
