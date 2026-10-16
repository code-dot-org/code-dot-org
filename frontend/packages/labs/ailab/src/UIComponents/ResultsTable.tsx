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

import tableStyles from './dataTable.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
  showAllColumns: boolean;
}

const featureHeader = classNames(
  tableStyles.header,
  tableStyles.headerFeature,
  styles.columnHeader
);
const labelHeader = classNames(
  tableStyles.header,
  tableStyles.headerLabel,
  styles.columnHeader
);
const nameHeader = classNames(tableStyles.header, styles.columnHeader);
const featureCell = classNames(
  tableStyles.bodyCell,
  tableStyles.bodyCellFeature
);
const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);
const indexHeader = classNames(
  tableStyles.indexCell,
  tableStyles.indexHeader,
  tableStyles.indexColumn
);

const ResultsTable = ({results, showAllColumns}: ResultsTableProps) => {
  const {project} = useProject();
  const selectedFeatures = project.selectedFeatures;
  const labelColumn = project.labelColumn || 'unknown';
  const data = useAppSelector(state => state.data);
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const extraColumns = showAllColumns
    ? Object.keys(data[0] ?? {}).filter(
        column => column !== labelColumn && !selectedFeatures.includes(column)
      )
    : [];

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);
  const cellValue = (value: string | number) =>
    getLocalizedValue(value, datasetId);

  return (
    <>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <div className={styles.frame}>
        <div className={styles.scroller}>
          <table className={classNames(tableStyles.table, styles.table)}>
            <thead>
              <tr>
                <th className={indexHeader} aria-label="Row" />
                {extraColumns.length > 0 && (
                  <th
                    scope="colgroup"
                    colSpan={extraColumns.length}
                    className={tableStyles.header}
                  />
                )}
                <th
                  scope="colgroup"
                  colSpan={selectedFeatures.length}
                  className={tableStyles.header}
                >
                  <CellText>Feature</CellText>
                </th>
                <th scope="col" className={tableStyles.header}>
                  <CellText>Actual</CellText>
                </th>
                <th scope="col" className={tableStyles.header}>
                  <CellText>AI Prediction</CellText>
                </th>
              </tr>
              <tr>
                <th className={classNames(indexHeader, styles.columnHeader)} />
                {extraColumns.map(column => (
                  <th key={column} scope="col" className={nameHeader}>
                    <CellText>{columnName(column)}</CellText>
                  </th>
                ))}
                {selectedFeatures.map(feature => (
                  <th key={feature} scope="col" className={featureHeader}>
                    <CellText>{columnName(feature)}</CellText>
                  </th>
                ))}
                <th scope="col" className={labelHeader}>
                  <CellText>{columnName(labelColumn)}</CellText>
                </th>
                <th scope="col" className={labelHeader}>
                  <CellText>{columnName(labelColumn)}</CellText>
                </th>
              </tr>
            </thead>
            <tbody>
              {results.examples.map((example, index) => {
                const row = results.rowIndices[index];
                return (
                  <tr key={index} className={tableStyles.row}>
                    <th scope="row" className={tableStyles.indexCell}>
                      <CellText>{row === undefined ? '' : row + 1}</CellText>
                    </th>
                    {extraColumns.map(column => (
                      <td key={column} className={tableStyles.bodyCell}>
                        <CellText>
                          {row === undefined
                            ? ''
                            : cellValue(data[row]?.[column] ?? '')}
                        </CellText>
                      </td>
                    ))}
                    {example.map((value, column) => (
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
