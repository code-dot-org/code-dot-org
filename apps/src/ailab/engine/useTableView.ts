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
  isNumerical: (column: string) => boolean;
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

// Unsorted, then ascending, then descending, then unsorted again.
export function nextSortDirection(
  direction: SortDirection | undefined
): SortDirection | undefined {
  if (!direction) {
    return 'ascending';
  }
  return direction === 'ascending' ? 'descending' : undefined;
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
