import {useState} from 'react';

import {ColumnTypes} from './constants';
import {compareText} from './helpers/utils';
import {useAppSelector} from './hooks';

export type SortDirection = 'ascending' | 'descending';

interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface TableView {
  rows: number[];
  columns: string[];
  isNumerical: (column: string) => boolean;
  sortDirection: (column: string) => SortDirection | undefined;
  toggleSort: (column: string) => void;
}

interface TableViewSource {
  rows: number[];
  columns: string[];
  columnTypes: Record<string, string>;
  valueAt: (row: number, column: string) => string | number;
}

function asNumber(value: string | number): number {
  return String(value).trim() === '' ? NaN : Number(value);
}

function compareValues(
  a: string | number,
  b: string | number,
  numerical: boolean
): number {
  const aNumber = numerical ? asNumber(a) : NaN;
  const bNumber = numerical ? asNumber(b) : NaN;
  if (Number.isNaN(aNumber) !== Number.isNaN(bNumber)) {
    return Number.isNaN(aNumber) ? 1 : -1;
  }
  return Number.isNaN(aNumber)
    ? compareText(String(a), String(b))
    : aNumber - bNumber;
}

export function nextSortDirection(
  direction: SortDirection | undefined
): SortDirection | undefined {
  if (!direction) {
    return 'ascending';
  }
  return direction === 'ascending' ? 'descending' : undefined;
}

export function useTableView({
  rows,
  columns,
  columnTypes,
  valueAt,
}: TableViewSource): TableView {
  const [sort, setSort] = useState<TableSort>();
  const isNumerical = (column: string) =>
    columnTypes[column] === ColumnTypes.NUMERICAL;

  let sortedRows = rows;
  if (sort && columns.includes(sort.column)) {
    const {column, direction} = sort;
    const sign = direction === 'ascending' ? 1 : -1;
    const numerical = isNumerical(column);
    sortedRows = [...rows].sort(
      (a, b) =>
        sign * compareValues(valueAt(a, column), valueAt(b, column), numerical)
    );
  }

  return {
    rows: sortedRows,
    columns,
    isNumerical,
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

export function useDatasetTableView(
  rows: number[],
  columns: string[]
): TableView {
  const data = useAppSelector(state => state.data);
  const columnTypes = useAppSelector(state => state.columnsByDataType);
  return useTableView({
    rows,
    columns,
    columnTypes,
    valueAt: (row, column) => data[row][column],
  });
}
