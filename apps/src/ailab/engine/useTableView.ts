import {useCallback, useMemo, useState} from 'react';

import {ColumnTypes} from './constants';
import {compareText} from './helpers/utils';
import {getLocalizedValue} from './helpers/valueDetails';
import {useAppSelector} from './hooks';

export type SortDirection = 'ascending' | 'descending';

export type ColumnId = string | symbol;

interface TableSort<Column extends ColumnId> {
  column: Column;
  direction: SortDirection;
}

export interface TableView<Column extends ColumnId = string> {
  rows: number[];
  columns: Column[];
  isNumerical(column: Column): boolean;
  sortDirection(column: Column): SortDirection | undefined;
  toggleSort(column: Column): void;
}

// Keep each input stable across renders, or every render sorts the whole dataset again.
interface TableViewSource<Column extends ColumnId> {
  rows: number[];
  columns: Column[];
  columnTypes: Partial<Record<ColumnId, string>>;
  valueAt: (row: number, column: Column) => string | number;
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

export function useTableView<Column extends ColumnId>({
  rows,
  columns,
  columnTypes,
  valueAt,
}: TableViewSource<Column>): TableView<Column> {
  const [sort, setSort] = useState<TableSort<Column>>();
  const isNumerical = (column: Column) =>
    columnTypes[column] === ColumnTypes.NUMERICAL;

  const sortedRows = useMemo(() => {
    if (!sort || !columns.includes(sort.column)) {
      return rows;
    }
    const {column, direction} = sort;
    const sign = direction === 'ascending' ? 1 : -1;
    const numerical = columnTypes[column] === ColumnTypes.NUMERICAL;
    const values = new Map(rows.map(row => [row, valueAt(row, column)]));
    return [...rows].sort(
      (a, b) => sign * compareValues(values.get(a)!, values.get(b)!, numerical)
    );
  }, [rows, columns, columnTypes, valueAt, sort]);

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
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const valueAt = useCallback(
    (row: number, column: string) =>
      getLocalizedValue(data[row][column], datasetId),
    [data, datasetId]
  );
  return useTableView({rows, columns, columnTypes, valueAt});
}
