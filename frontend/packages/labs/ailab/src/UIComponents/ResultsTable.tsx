/* The reserved rows: what the model was given, the actual label, and its prediction. */
import classNames from 'classnames';

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
        <thead>
          <tr>
            <th
              scope="colgroup"
              colSpan={selectedFeatures.length}
              className={tableStyles.header}
            >
              Feature
            </th>
            <th scope="col" className={tableStyles.header}>
              Actual
            </th>
            <th scope="col" className={tableStyles.header}>
              AI Prediction
            </th>
          </tr>
          <tr>
            {selectedFeatures.map(feature => (
              <th key={feature} scope="col" className={featureHeader}>
                {columnName(feature)}
              </th>
            ))}
            <th scope="col" className={labelHeader}>
              {columnName(labelColumn)}
            </th>
            <th scope="col" className={labelHeader}>
              {columnName(labelColumn)}
            </th>
          </tr>
        </thead>
        <tbody>
          {results.examples.map((example, index) => (
            <tr key={index} className={tableStyles.row}>
              {example.map((value, column) => (
                <td key={column} className={featureCell}>
                  {cellValue(value)}
                </td>
              ))}
              <td className={labelCell}>{cellValue(results.labels[index])}</td>
              <td className={labelCell}>
                {cellValue(results.predictedLabels[index])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
