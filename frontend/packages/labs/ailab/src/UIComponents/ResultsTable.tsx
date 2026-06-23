/* React component to handle displaying test data and A.I. Bot's guesses. */
import {useCallback} from 'react';

import {styles, colors, REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getLocalizedColumnName, isRegression} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setResultsHighlightRow} from '../redux';
import type {ResultsData} from '../types';

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

  const getRowCellStyle = useCallback(
    (index: number) => {
      return {
        ...styles.tableCell,
        ...(index === resultsHighlightRow && styles.resultsCellHighlight),
      };
    },
    [resultsHighlightRow],
  );

  const featureCount = selectedFeatures.length;

  return (
    <div style={styles.panel}>
      {isRegressionMode && (
        <div style={styles.smallTextRight}>
          {I18n.t('resultsTablePredictionRange', {
            percentage: REGRESSION_ERROR_TOLERANCE,
          })}
        </div>
      )}

      <div style={styles.tableParent}>
        <table style={styles.displayTable}>
          <thead>
            <tr>
              <th
                colSpan={featureCount}
                style={{
                  ...styles.tableHeader,
                  ...styles.resultsTableFirstHeader,
                }}
              >
                {I18n.t('resultsTableFeatureHeader')}
              </th>
              <th
                style={{
                  ...styles.tableHeader,
                  ...styles.resultsTableFirstHeader,
                }}
              >
                {I18n.t('resultsTableActualValueHeader')}
              </th>
              <th
                style={{
                  ...styles.tableHeader,
                  ...styles.resultsTableFirstHeader,
                }}
              >
                {I18n.t('resultsTablePredictedValueHeader')}
              </th>
            </tr>
            <tr>
              {selectedFeatures.map((feature, index) => {
                return (
                  <th
                    style={{
                      ...styles.tableHeader,
                      backgroundColor: colors.feature,
                      ...styles.resultsTableSecondHeader,
                    }}
                    key={index}
                  >
                    {getLocalizedColumnName(datasetId, feature)}
                  </th>
                );
              })}
              <th
                style={{
                  ...styles.tableHeader,
                  backgroundColor: colors.label,
                  ...styles.resultsTableSecondHeader,
                }}
              >
                {getLocalizedColumnName(datasetId, labelColumn)}
              </th>
              <th
                style={{
                  ...styles.tableHeader,
                  backgroundColor: colors.label,
                  ...styles.resultsTableSecondHeader,
                }}
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
                      <td style={getRowCellStyle(index)} key={i}>
                        {getLocalizedValue(example, datasetId)}
                      </td>
                    );
                  })}
                  <td style={getRowCellStyle(index)}>
                    {getLocalizedValue(results.labels[index], datasetId)}
                  </td>
                  <td style={getRowCellStyle(index)}>
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
