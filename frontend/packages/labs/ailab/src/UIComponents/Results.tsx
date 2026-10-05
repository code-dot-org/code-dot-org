/* React component to handle displaying accuracy results. */
import classNames from 'classnames';
import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setShowResultsDetails} from '../redux';

import DecisionTree from './DecisionTree';
import ResultsDetails from './ResultsDetails';
import ScrollableContent from './ScrollableContent';
import {UnconnectedStatement} from './Statement';

import shared from '../shared.module.scss';
import styles from './results.module.scss';

const Results = () => {
  const historicResults = useAppSelector(state => state.historicResults);
  const showResultsDetails = useAppSelector(state => state.showResultsDetails);
  const dispatch = useAppDispatch();

  const showDetails = useCallback(() => {
    dispatch(setShowResultsDetails(true));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {showResultsDetails && <ResultsDetails />}

      <div id="results" className={shared.panel}>
        <ScrollableContent>
          <div className={shared.largeText}>
            <div className={styles.heading}>{I18n.t('resultsHeader')}</div>
            <div className={styles.accuracyHeading}>
              {I18n.t('resultsAccuracy')}
            </div>
          </div>
          {historicResults.map((historicResult, index) => {
            return (
              <div key={index}>
                <div className={styles.statement}>
                  <UnconnectedStatement
                    shouldShow={true}
                    smallFont={true}
                    labelColumn={historicResult.label}
                    selectedFeatures={historicResult.features}
                  />
                </div>
                <div className={classNames(styles.accuracy, shared.bold)}>
                  {historicResult.accuracy}%
                </div>
                {index === 0 && (
                  <div className={styles.detailsButtonContainer}>
                    <button
                      id="uitest-details-button"
                      type="button"
                      onClick={showDetails}
                      className={styles.detailsButton}
                    >
                      {I18n.t('resultsDetailsButton')}
                    </button>
                  </div>
                )}
                {index === 0 && <DecisionTree />}
                {index === 0 && historicResults.length > 1 && (
                  <div
                    className={classNames(
                      shared.largeText,
                      styles.previousResults,
                    )}
                  >
                    <div className={styles.heading}>
                      {I18n.t('resultsPreviousResults')}
                    </div>
                    <div className={styles.accuracyHeading}>
                      {I18n.t('resultsAccuracy')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </ScrollableContent>
      </div>
    </div>
  );
};

export default Results;
