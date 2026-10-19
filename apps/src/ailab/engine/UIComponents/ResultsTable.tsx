import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {
  dataColumnsFor,
  getColumnRole,
  isRegression,
} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {ResultsData} from '../types';
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

const featureCell = classNames(
  tableStyles.bodyCell,
  tableStyles.bodyCellFeature
);
const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);

const ResultsTable = ({results, showAllColumns}: ResultsTableProps) => {
  const {project} = useProject();
  const selectedFeatures = project.selectedFeatures;
  const labelColumn = project.labelColumn || 'unknown';
  const data = useAppSelector(state => state.data);
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns),
    [data, project, showAllColumns]
  );

  const rowValues = useMemo(
    () =>
      results.examples.map((example, index) => {
        const row = results.rowIndices[index];
        const columnValue = (column: string) => {
          const feature = selectedFeatures.indexOf(column);
          return feature === -1 ? data[row][column] : example[feature];
        };
        return {
          ...Object.fromEntries(
            columns.map(column => [column, columnValue(column)])
          ),
          [labelColumn]: results.labels[index],
          [PREDICTION_COLUMN]: results.predictedLabels[index],
        };
      }),
    [results, columns, selectedFeatures, labelColumn, data]
  );
  const viewColumns = useMemo(
    () => [...columns, labelColumn, PREDICTION_COLUMN],
    [columns, labelColumn]
  );
  const viewColumnTypes = useMemo(
    () => ({
      ...columnsByDataType,
      [PREDICTION_COLUMN]: columnsByDataType[labelColumn],
    }),
    [columnsByDataType, labelColumn]
  );
  const view = useTableView({
    data: rowValues,
    columns: viewColumns,
    columnTypes: viewColumnTypes,
  });

  const cellValue = (value: string | number) =>
    getLocalizedValue(value, datasetId);

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
            <RowsTableHeader
              columns={[...columns, labelColumn]}
              view={view}
              showPrediction
              predictionByRow
            />
          </thead>
          <tbody>
            {view.rows.map(index => {
              const values = rowValues[index];
              return (
                <tr key={index} className={tableStyles.row}>
                  <th scope="row" className={tableStyles.indexCell}>
                    <CellText>{results.rowIndices[index] + 1}</CellText>
                  </th>
                  {columns.map(column => (
                    <td
                      key={column}
                      className={
                        getColumnRole(project, column) === 'feature'
                          ? featureCell
                          : tableStyles.bodyCell
                      }
                    >
                      <CellText>{cellValue(values[column])}</CellText>
                    </td>
                  ))}
                  <td className={labelCell}>
                    <CellText>{cellValue(values[labelColumn])}</CellText>
                  </td>
                  <td className={labelCell}>
                    <CellText>{cellValue(values[PREDICTION_COLUMN])}</CellText>
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
