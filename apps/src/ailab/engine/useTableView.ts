import {useCallback, useMemo, useState} from 'react';

import {ColumnTypes} from './constants';
import {compareText} from './helpers/utils';
import type {DataRow} from './types';

export type SortDirection = 'ascending' | 'descending';

export type ColumnId = string | symbol;

interface TableSort {
  column: ColumnId;
  direction: SortDirection;
}

export interface TableView<Column extends ColumnId = ColumnId> {
  rows: number[];
  columns: Column[];
  isNumerical: (column: ColumnId) => boolean;
  sortDirection: (column: ColumnId) => SortDirection | undefined;
  toggleSort: (column: ColumnId) => void;
}

// Keep rows and valueAt stable across renders, or every render sorts again.
interface TableViewSource<Column extends ColumnId> {
  rows: number[];
  columns: Column[];
  columnTypes: Partial<Record<ColumnId, string>>;
  valueAt: (row: number, column: Column) => string | number;
}

interface SortKey {
  row: number;
  text: string;
  number: number;
}

function sortKey(
  row: number,
  value: string | number,
  numerical: boolean
): SortKey {
  const text = String(value);
  const number = numerical && text.trim() !== '' ? Number(text) : NaN;
  return {row, text, number};
}

function compareKeys(a: SortKey, b: SortKey): number {
  const aIsNumber = !Number.isNaN(a.number);
  const bIsNumber = !Number.isNaN(b.number);
  if (aIsNumber && bIsNumber) {
    return a.number - b.number;
  }
  if (aIsNumber !== bIsNumber) {
    return aIsNumber ? -1 : 1;
  }
  return compareText(a.text, b.text);
}

export function nextSortDirection(
  direction: SortDirection | undefined
): SortDirection | undefined {
  if (!direction) {
    return 'ascending';
  }
  return direction === 'ascending' ? 'descending' : undefined;
}

export function useDatasetValueAt(data: DataRow[]) {
  return useCallback(
    (row: number, column: string) => data[row][column],
    [data]
  );
}

export function useTableView<Column extends ColumnId>({
  rows,
  columns,
  columnTypes,
  valueAt,
}: TableViewSource<Column>): TableView<Column> {
  const [sort, setSort] = useState<TableSort>();

  const sortedRows = useMemo(() => {
    const column = columns.find(shown => shown === sort?.column);
    if (!sort || column === undefined) {
      return rows;
    }
    const numerical = columnTypes[column] === ColumnTypes.NUMERICAL;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return rows
      .map(row => sortKey(row, valueAt(row, column), numerical))
      .sort((a, b) => sign * compareKeys(a, b))
      .map(key => key.row);
  }, [rows, columns, columnTypes, valueAt, sort]);

  return {
    rows: sortedRows,
    columns,
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
