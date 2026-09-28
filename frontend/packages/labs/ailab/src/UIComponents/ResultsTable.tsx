/* React component to handle displaying test data and A.I. Bot's guesses. */
import {useCallback} from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getLocalizedColumnName, isRegression} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setResultsHighlightRow} from '../redux';
import type {ResultsData} from '../types';

import shared from '../shared.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
}

const ResultsTable = ({results}: ResultsTableProps) => {
  const dispatch = useAppDispatch();
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const labelColumn = useAppSelector(state => state.labelColumn || 'unknown');
  const isRegressionMode = useAppSelector(isRegression);
  const resultsHighlightRow = useAppSelector(
    state => state.resultsHighlightRow,
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');

  const highlightRow = (row: number | undefined) =>
    dispatch(setResultsHighlightRow(row as number));

  const getRowCellClassName = useCallback(
    (index: number) => {
      return index === resultsHighlightRow
        ? `${shared.tableCell} ${styles.highlighted}`
        : shared.tableCell;
    },
    [resultsHighlightRow],
  );

  const featureCount = selectedFeatures.length;

  return (
    <div className={shared.panel}>
      {isRegressionMode && (
        <div className={styles.rangeNote}>
          {I18n.t('resultsTablePredictionRange', {
            percentage: REGRESSION_ERROR_TOLERANCE,
          })}
        </div>
      )}

      <div className={shared.tableParent}>
        <table className={shared.displayTable}>
          <thead>
            <tr>
              <th
                colSpan={featureCount}
                className={`${styles.header} ${styles.groupHeader}`}
              >
                {I18n.t('resultsTableFeatureHeader')}
              </th>
              <th className={`${styles.header} ${styles.groupHeader}`}>
                {I18n.t('resultsTableActualValueHeader')}
              </th>
              <th className={`${styles.header} ${styles.groupHeader}`}>
                {I18n.t('resultsTablePredictedValueHeader')}
              </th>
            </tr>
            <tr>
              {selectedFeatures.map((feature, index) => {
                return (
                  <th
                    className={`${styles.header} ${styles.featureHeader} ${styles.columnHeader}`}
                    key={index}
                  >
                    {getLocalizedColumnName(datasetId, feature)}
                  </th>
                );
              })}
              <th
                className={`${styles.header} ${styles.labelHeader} ${styles.columnHeader}`}
              >
                {getLocalizedColumnName(datasetId, labelColumn)}
              </th>
              <th
                className={`${styles.header} ${styles.labelHeader} ${styles.columnHeader}`}
              >
                {getLocalizedColumnName(datasetId, labelColumn)}
              </th>
            </tr>
          </thead>
          <tbody>
            {results.examples.map((examples, index) => {
              return (
                <tr
                  key={index}
                  onMouseEnter={() => highlightRow(index)}
                  onMouseLeave={() => highlightRow(undefined)}
                >
                  {examples.map((example, i) => {
                    return (
                      <td className={getRowCellClassName(index)} key={i}>
                        {getLocalizedValue(example, datasetId)}
                      </td>
                    );
                  })}
                  <td className={getRowCellClassName(index)}>
                    {getLocalizedValue(results.labels[index], datasetId)}
                  </td>
                  <td className={getRowCellClassName(index)}>
                    {getLocalizedValue(
                      results.predictedLabels[index],
                      datasetId,
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
