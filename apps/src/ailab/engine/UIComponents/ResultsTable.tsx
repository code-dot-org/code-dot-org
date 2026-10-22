import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useMemo} from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {
  dataColumnsFor,
  getColumnRole,
  isRegression,
} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getFilterableColumns} from '../selectors';
import type {ColumnId, ResultsData} from '../types';
import {useTableView} from '../useTableView';

import CellText from './CellText';
import DataTableFrame from './DataTableFrame';
import RowsTableHeader, {PREDICTION_COLUMN} from './RowsTableHeader';

import tableStyles from './dataTable.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
  showAllColumns: boolean;
}

const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);

const ResultsTable = ({results, showAllColumns}: ResultsTableProps) => {
  const {project} = useProject();
  const selectedFeatures = project.selectedFeatures;
  const labelColumn = project.labelColumn || 'unknown';
  const data = useAppSelector(state => state.data);
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);
  const filterableColumns = useAppSelector(getFilterableColumns);
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns),
    [data, project, showAllColumns]
  );
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
  const view = useTableView({
    rows,
    columns: viewColumns,
    columnTypes,
    filterableColumns: viewFilterableColumns,
    valueAt,
  });

  return (
    <>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <DataTableFrame label="Results">
        <table className={tableStyles.table}>
          <thead>
            <RowsTableHeader columns={columns} view={view} showPrediction />
          </thead>
          <tbody>
            {view.rows.map(index => {
              return (
                <tr key={index} className={tableStyles.row}>
                  <th scope="row" className={tableStyles.indexCell}>
                    <CellText>{results.rowIndices[index] + 1}</CellText>
                  </th>
                  {columns.map(column => {
                    const role = getColumnRole(project, column);
                    return (
                      <td
                        key={column}
                        className={classNames(tableStyles.bodyCell, {
                          [tableStyles.bodyCellLabel]: role === 'label',
                          [tableStyles.bodyCellFeature]: role === 'feature',
                        })}
                      >
                        <CellText>{valueAt(index, column)}</CellText>
                      </td>
                    );
                  })}
                  <td className={labelCell}>
                    <CellText>{valueAt(index, PREDICTION_COLUMN)}</CellText>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {results.examples.length === 0 && (
          <Typography
            variant="body4"
            component="p"
            className={styles.emptyNote}
          >
            No rows matched this filter
          </Typography>
        )}
      </DataTableFrame>
    </>
  );
};

export default ResultsTable;
