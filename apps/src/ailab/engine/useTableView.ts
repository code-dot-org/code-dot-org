import {useState} from 'react';

import {ColumnTypes} from './constants';
import {compareText} from './helpers/utils';
import {useAppSelector} from './hooks';

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
  if (numerical) {
    const aNumber = asNumber(a);
    const bNumber = asNumber(b);
    const aIsNumber = !Number.isNaN(aNumber);
    const bIsNumber = !Number.isNaN(bNumber);
    if (aIsNumber && bIsNumber) {
      return aNumber - bNumber;
    }
    if (aIsNumber !== bIsNumber) {
      return aIsNumber ? -1 : 1;
    }
  }
  return compareText(String(a), String(b));
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
  const [sort, setSort] = useState<TableSort>();
  const isNumerical = (column: ColumnId) =>
    columnTypes[column] === ColumnTypes.NUMERICAL;
  const sortColumn = columns.find(column => column === sort?.column);

  let sortedRows = rows;
  if (sort && sortColumn !== undefined) {
    const sign = sort.direction === 'ascending' ? 1 : -1;
    const numerical = isNumerical(sortColumn);
    sortedRows = [...rows].sort(
      (a, b) =>
        sign *
        compareValues(valueAt(a, sortColumn), valueAt(b, sortColumn), numerical)
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
): TableView<string> {
  const data = useAppSelector(state => state.data);
  const columnTypes = useAppSelector(state => state.columnsByDataType);
  return useTableView({
    rows,
    columns,
    columnTypes,
    valueAt: (row, column) => data[row][column],
  });
}
