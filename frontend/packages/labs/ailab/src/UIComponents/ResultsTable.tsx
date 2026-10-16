import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getLocalizedColumnName, isRegression} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {ResultsData} from '../types';

import CellText from './CellText';
import PredictionHeader from './PredictionHeader';

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
  // The label is the Actual column, so it is not repeated in this list.
  const datasetColumns = Object.keys(data[0] ?? {}).filter(
    column => column !== labelColumn
  );

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);
  const cellValue = (value: string | number) =>
    getLocalizedValue(value, datasetId);
  const isFeature = (column: string) => selectedFeatures.includes(column);
  const datasetCell = (column: string) =>
    isFeature(column) ? featureCell : tableStyles.bodyCell;
  // Without a dataset row number only the example's feature values are known.
  const datasetValue = (
    example: (string | number)[],
    row: number | undefined,
    column: string
  ) => {
    if (row !== undefined) {
      return cellValue(data[row]?.[column] ?? '');
    }
    const feature = selectedFeatures.indexOf(column);
    return feature === -1 ? '' : cellValue(example[feature]);
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
              <PredictionHeader
                columns={showAllColumns ? datasetColumns : selectedFeatures}
                labelColumn={labelColumn}
                columnName={columnName}
                isFeature={isFeature}
              />
            </thead>
            <tbody>
              {results.examples.map((example, index) => {
                const row = results.rowIndices[index];
                return (
                  <tr key={index} className={tableStyles.row}>
                    <th scope="row" className={tableStyles.indexCell}>
                      <CellText>{row === undefined ? '' : row + 1}</CellText>
                    </th>
                    {showAllColumns
                      ? datasetColumns.map(column => (
                          <td key={column} className={datasetCell(column)}>
                            <CellText>
                              {datasetValue(example, row, column)}
                            </CellText>
                          </td>
                        ))
                      : example.map((value, column) => (
                          <td key={column} className={featureCell}>
                            <CellText>{cellValue(value)}</CellText>
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
