import {useCallback, useMemo} from 'react';

import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getFilterableColumns} from '../selectors';
import type {ColumnId, ResultsData, TableView} from '../types';
import {useTableView} from '../useTableView';

import {PREDICTION_COLUMN} from './RowsTableHeader';

export function useResultsTableView(
  results: ResultsData,
  columns: string[]
): TableView {
  const {project} = useProject();
  const selectedFeatures = project.selectedFeatures;
  const labelColumn = project.labelColumn || 'unknown';
  const data = useAppSelector(state => state.data);
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);
  const filterableColumns = useAppSelector(getFilterableColumns);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const rows = useMemo(() => [...results.examples.keys()], [results]);
  const viewColumns = useMemo<ColumnId[]>(
    () => [...columns, PREDICTION_COLUMN],
    [columns]
  );
  const columnTypes = useMemo(
    () => ({
      ...columnsByDataType,
      [PREDICTION_COLUMN]: columnsByDataType[labelColumn],
    }),
    [columnsByDataType, labelColumn]
  );
  const viewFilterableColumns = useMemo<ColumnId[]>(
    () =>
      filterableColumns.includes(labelColumn)
        ? [...filterableColumns, PREDICTION_COLUMN]
        : filterableColumns,
    [filterableColumns, labelColumn]
  );
  const rawValueAt = useCallback(
    (index: number, column: ColumnId) => {
      if (typeof column === 'symbol') {
        return results.predictedLabels[index];
      }
      if (column === labelColumn) {
        return results.labels[index];
      }
      const feature = selectedFeatures.indexOf(column);
      return feature === -1
        ? data[results.rowIndices[index]][column]
        : results.examples[index][feature];
    },
    [results, labelColumn, selectedFeatures, data]
  );
  const valueAt = useCallback(
    (index: number, column: ColumnId) =>
      getLocalizedValue(rawValueAt(index, column), datasetId),
    [rawValueAt, datasetId]
  );
  return useTableView({
    rows,
    columns: viewColumns,
    columnTypes,
    filterableColumns: viewFilterableColumns,
    valueAt,
  });
}
