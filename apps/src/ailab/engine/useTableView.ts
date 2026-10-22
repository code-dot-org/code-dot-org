import {useCallback, useMemo, useState} from 'react';

import {ColumnTypes} from './constants';
import type {Grade} from './helpers/displayTreeNodeContent';
import type {DisplayTreeNodeCounts} from './helpers/displayTreeTrace';
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

  const matchingRows = useMemo(() => {
    if (!filter) {
      return rows;
    }
    const checked = new Set(filter.values);
    return rows.filter(row => checked.has(String(valueAt(row, filter.column))));
  }, [rows, valueAt, filter]);

  const shownRows = useMemo(() => {
    if (!sort || !columns.includes(sort.column)) {
      return matchingRows;
    }
    const {column, direction} = sort;
    const sign = direction === 'ascending' ? 1 : -1;
    const numerical = columnTypes[column] === ColumnTypes.NUMERICAL;
    const values = new Map(
      matchingRows.map(row => [row, valueAt(row, column)])
    );
    return [...matchingRows].sort(
      (a, b) => sign * compareValues(values.get(a)!, values.get(b)!, numerical)
    );
  }, [matchingRows, columns, columnTypes, valueAt, sort]);

  const rowOptions = useMemo(() => {
    const optionsByColumn = new Map<ColumnId, string[]>();
    return (column: ColumnId) => {
      let options = optionsByColumn.get(column);
      if (!options) {
        options = [...new Set(rows.map(row => String(valueAt(row, column))))]
          .filter(option => option !== '')
          .sort(compareText);
        optionsByColumn.set(column, options);
      }
      return options;
    };
  }, [rows, valueAt]);

  return {
    rows: shownRows,
    totalRowCount: rows.length,
    columns,
    shownFilterableColumns: columns.filter(column =>
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
    filterOptions: column => {
      const options = rowOptions(column);
      const missingChecked =
        filter?.column === column
          ? filter.values.filter(value => !options.includes(value))
          : [];
      return missingChecked.length
        ? [...options, ...missingChecked].sort(compareText)
        : options;
    },
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

// The view spans every grade, so each grade's count follows the filter.
export function viewForGrade<View extends TableView>(
  view: View,
  rowsByGrade: Record<Grade, number[]>,
  grade: Grade
): {view: View; counts: DisplayTreeNodeCounts} {
  const matchingRows = (rowGrade: Grade) => {
    const gradeRows = new Set(rowsByGrade[rowGrade]);
    return view.rows.filter(row => gradeRows.has(row));
  };
  const matching = {
    correct: matchingRows('correct'),
    incorrect: matchingRows('incorrect'),
  };
  return {
    view: {
      ...view,
      rows: matching[grade],
      totalRowCount: rowsByGrade[grade].length,
    },
    counts: {
      correct: matching.correct.length,
      incorrect: matching.incorrect.length,
    },
  };
}
