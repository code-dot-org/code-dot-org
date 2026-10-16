import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

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

import CellText from './CellText';
import RowsTableHeader from './RowsTableHeader';

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
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const columns = dataColumnsFor(data, project, showAllColumns);

  const cellValue = (value: string | number) =>
    getLocalizedValue(value, datasetId);
  const columnValue = (
    example: (string | number)[],
    row: number,
    column: string
  ) => {
    const feature = selectedFeatures.indexOf(column);
    return cellValue(feature === -1 ? data[row][column] : example[feature]);
  };

  return (
    <>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <div className={styles.frame}>
        <div className={styles.scroller}>
          <table className={tableStyles.table}>
            <thead>
              <RowsTableHeader
                columns={[...columns, labelColumn]}
                showPrediction
              />
            </thead>
            <tbody>
              {results.examples.map((example, index) => {
                const row = results.rowIndices[index];
                return (
                  <tr key={index} className={tableStyles.row}>
                    <th scope="row" className={tableStyles.indexCell}>
                      <CellText>{row + 1}</CellText>
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
                        <CellText>{columnValue(example, row, column)}</CellText>
                      </td>
                    ))}
                    <td className={labelCell}>
                      <CellText>{cellValue(results.labels[index])}</CellText>
                    </td>
                    <td className={labelCell}>
                      <CellText>
                        {cellValue(results.predictedLabels[index])}
                      </CellText>
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
        </div>
      </div>
    </>
  );
};

export default ResultsTable;
