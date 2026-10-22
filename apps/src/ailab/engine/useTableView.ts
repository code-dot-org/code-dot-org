import {useCallback, useMemo, useState} from 'react';

import {ColumnTypes} from './constants';
import {compareText} from './helpers/utils';
import {getLocalizedValue} from './helpers/valueDetails';
import {useAppSelector} from './hooks';
import {getFilterableColumns} from './selectors';
import type {
  ColumnFilter,
  ColumnId,
  DatasetTableView,
  SortDirection,
  TableView,
} from './types';

interface TableSort {
  column: ColumnId;
  direction: SortDirection;
}

// Keep each input stable across renders, or every render sorts the whole dataset again.
interface TableViewSource {
  rows: number[];
  columns: ColumnId[];
  columnTypes: Partial<Record<ColumnId, string>>;
  filterableColumns: ColumnId[];
  valueAt: (row: number, column: ColumnId) => string | number;
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
  filterableColumns,
  valueAt,
}: TableViewSource): TableView {
  const [sort, setSort] = useState<TableSort>();
  const [filter, setFilter] = useState<ColumnFilter>();
  const isNumerical = (column: ColumnId) =>
    columnTypes[column] === ColumnTypes.NUMERICAL;

  const shownRows = useMemo(() => {
    const matchingRows = rows.filter(
      row =>
        !filter || filter.values.includes(String(valueAt(row, filter.column)))
    );
    if (!sort || !columns.includes(sort.column)) {
      return matchingRows;
    }
    const {column, direction} = sort;
    const sign = direction === 'ascending' ? 1 : -1;
    const numerical = columnTypes[column] === ColumnTypes.NUMERICAL;
    const values = new Map(
      matchingRows.map(row => [row, valueAt(row, column)])
    );
    return matchingRows.sort(
      (a, b) => sign * compareValues(values.get(a)!, values.get(b)!, numerical)
    );
  }, [rows, columns, columnTypes, valueAt, sort, filter]);

  return {
    rows: shownRows,
    totalRows: rows.length,
    columns,
    filterableColumns: columns.filter(column =>
      filterableColumns.includes(column)
    ),
    filter,
    valueAt,
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
    // A checked value stays listed after the rows change, so it can be unchecked.
    filterOptions: column =>
      [
        ...new Set([
          ...rows.map(row => String(valueAt(row, column))),
          ...(filter?.column === column ? filter.values : []),
        ]),
      ]
        .filter(option => option !== '')
        .sort(compareText),
    filterBy: (column, values) =>
      setFilter(values.length ? {column, values} : undefined),
    clearFilter: () => setFilter(undefined),
  };
}

export function useDatasetTableView(
  rows: number[],
  columns: string[]
): DatasetTableView {
  const data = useAppSelector(state => state.data);
  const columnTypes = useAppSelector(state => state.columnsByDataType);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const filterableColumns = useAppSelector(getFilterableColumns);
  const valueAt = useCallback(
    (row: number, column: ColumnId) =>
      getLocalizedValue(data[row][column as string], datasetId),
    [data, datasetId]
  );
  return {
    ...useTableView({rows, columns, columnTypes, filterableColumns, valueAt}),
    columns,
  };
}
