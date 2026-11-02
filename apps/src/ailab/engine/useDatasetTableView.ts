import {useCallback} from 'react';

import {getLocalizedValue} from './helpers/valueDetails';
import {useAppSelector} from './hooks';
import {
  getColumnsByDataType,
  getData,
  getDatasetId,
  getFilterableColumns,
} from './selectors';
import type {ColumnId, DatasetTableView} from './types';
import {useTableView} from './useTableView';

export function useDatasetTableView(
  rows: number[],
  columns: string[]
): DatasetTableView {
  const data = useAppSelector(getData);
  const columnTypes = useAppSelector(getColumnsByDataType);
  const datasetId = useAppSelector(state => getDatasetId(state) || 'unknown');
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
