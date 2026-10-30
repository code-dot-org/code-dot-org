import {useCallback} from 'react';

import {getLocalizedValue} from './helpers/valueDetails';
import {useAppSelector} from './hooks';
import {getFilterableColumns} from './selectors';
import type {ColumnId, DatasetTableView} from './types';
import {useTableView} from './useTableView';

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
