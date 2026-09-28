/*
  React component to render a special kind of crosstab table, with a row for
  each active combination of features values, and corresponding percentage of
  label values, with a heatmap style applied.
*/
import {useCallback} from 'react';

import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getCrossTabData} from '../selectors/visualizationSelectors';

import ScrollableContent from './ScrollableContent';

import shared from '../shared.module.scss';
import styles from './crossTab.module.scss';

const CrossTab = () => {
  const crossTabData = useAppSelector(getCrossTabData);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const getCellClassName = useCallback((percent: number) => {
    return `${styles.cell} ${styles[`heat${Math.round(percent / 20)}`]}`;
  }, []);

  // There are a few criteria that affect how big the table looks.  We'll not
  // render it if any of them are exceeded.
  // First, how many columns are there on the left side.
  const maxFeaturesInTable = 5;
  // Second, how many columns are there in the main table.
  const maxUniqueLabelValues = 5;
  // Third, how many rows are there.
  const maxResults = 5;

  const showTable =
    crossTabData &&
    crossTabData.featureNames.length <= maxFeaturesInTable &&
    crossTabData.uniqueLabelValues.length <= maxUniqueLabelValues &&
    crossTabData.results.length <= maxResults;

  return (
    <div id="cross-tab">
      {crossTabData && !showTable && (
        <div>
          <div className={shared.bold}>
            {I18n.t('crossTabRelationshipHeader')}
          </div>

          <div>{I18n.t('crossTabTooMuchData')}</div>
          <br />
        </div>
      )}

      {showTable && (
        <div>
          <div className={shared.bold}>
            {I18n.t('crossTabRelationshipHeader')}
          </div>
          <ScrollableContent>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.header} />
                  <th
                    className={styles.header}
                    colSpan={crossTabData.featureNames.length}
                  >
                    &nbsp;
                  </th>
                  <th
                    colSpan={crossTabData.uniqueLabelValues.length}
                    className={`${styles.header} ${shared.bold}`}
                  >
                    {crossTabData.labelName}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={crossTabData.results.length + 1}>
                    <div className={`${shared.bold} ${styles.featureName}`}>
                      {crossTabData.featureNames[0]}
                    </div>
                  </td>
                  <td />
                  {crossTabData.uniqueLabelValues.map(
                    (uniqueLabelValue, index) => {
                      return (
                        <td key={index} className={shared.tableCell}>
                          {getLocalizedValue(uniqueLabelValue, datasetId)}
                        </td>
                      );
                    },
                  )}
                </tr>
                {crossTabData.results.map((result, resultIndex) => {
                  return (
                    <tr key={resultIndex}>
                      {result.featureValues.map(
                        (featureValue, featureIndex) => {
                          return (
                            <td key={featureIndex} className={shared.tableCell}>
                              {getLocalizedValue(featureValue, datasetId)}
                            </td>
                          );
                        },
                      )}
                      {crossTabData.uniqueLabelValues.map(
                        (uniqueLabelValue, labelIndex) => {
                          return (
                            <td
                              key={labelIndex}
                              className={getCellClassName(
                                result.labelPercents?.[uniqueLabelValue] ?? 0,
                              )}
                            >
                              {result.labelPercents?.[uniqueLabelValue] || 0}%
                            </td>
                          );
                        },
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollableContent>
        </div>
      )}
    </div>
  );
};

export default CrossTab;
