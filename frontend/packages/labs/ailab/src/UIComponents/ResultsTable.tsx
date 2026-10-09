import {Typography} from '@mui/material';
import classNames from 'classnames';
import type {ReactNode} from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getLocalizedColumnName, isRegression} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import type {ResultsData} from '../types';

import tableStyles from './dataTable.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
}

const featureHeader = classNames(
  tableStyles.header,
  tableStyles.headerFeature,
  styles.columnHeader,
);
const labelHeader = classNames(
  tableStyles.header,
  tableStyles.headerLabel,
  styles.columnHeader,
);
const featureCell = classNames(
  tableStyles.bodyCell,
  tableStyles.bodyCellFeature,
);
const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);

const CellText = ({children}: {children: ReactNode}) => (
  <Typography component="span" variant="body4" className={tableStyles.cellText}>
    {children}
  </Typography>
);

const ResultsTable = ({results}: ResultsTableProps) => {
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const labelColumn = useAppSelector(state => state.labelColumn || 'unknown');
  const isRegressionMode = useAppSelector(isRegression);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);
  const cellValue = (value: string | number) =>
    getLocalizedValue(value, datasetId);

  return (
    <div className={styles.scroller}>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <table className={classNames(tableStyles.table, styles.table)}>
        <colgroup span={selectedFeatures.length} />
        <thead>
          <tr>
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
          {results.examples.map((example, index) => (
            <tr key={index} className={tableStyles.row}>
              {example.map((value, column) => (
                <td key={column} className={featureCell}>
                  <CellText>{cellValue(value)}</CellText>
                </td>
              ))}
              <td className={labelCell}>
                <CellText>{cellValue(results.labels[index])}</CellText>
              </td>
              <td className={labelCell}>
                <CellText>{cellValue(results.predictedLabels[index])}</CellText>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
