/* React component to handle displaying accuracy results. */
import {useEffect, useCallback} from 'react';

import {styles} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setShowResultsDetails, setResultsPhase} from '../redux';

import ResultsDetails from './ResultsDetails';
import ScrollableContent from './ScrollableContent';
import {UnconnectedStatement} from './Statement';

const Results = () => {
  const historicResults = useAppSelector(state => state.historicResults);
  const showResultsDetails = useAppSelector(state => state.showResultsDetails);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setResultsPhase(0));
    const timer = setTimeout(() => {
      dispatch(setResultsPhase(1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const showDetails = useCallback(() => {
    dispatch(setShowResultsDetails(true));
  }, [dispatch]);

  return (
    <div style={styles.resultsPanelContainer}>
      {showResultsDetails && <ResultsDetails />}

      <div id="results" style={styles.panel}>
        <ScrollableContent>
          <div style={styles.largeText}>
            <div style={styles.resultsHeader}>{I18n.t('resultsHeader')}</div>
            <div style={styles.resultsHeaderAccuracy}>
              {I18n.t('resultsAccuracy')}
            </div>
          </div>
          {historicResults.map((historicResult, index) => {
            return (
              <div key={index}>
                <div style={styles.resultsStatement}>
                  <UnconnectedStatement
                    shouldShow={true}
                    smallFont={true}
                    labelColumn={historicResult.label}
                    selectedFeatures={historicResult.features}
                  />
                </div>
                <div style={{...styles.resultsAccuracy, ...styles.bold}}>
                  {historicResult.accuracy}%
                </div>
                {index === 0 && (
                  <div style={styles.resultsDetailsButtonContainer}>
                    <button
                      id="uitest-details-button"
                      type="button"
                      onClick={showDetails}
                      style={styles.resultsDetailsButton}
                    >
                      {I18n.t('resultsDetailsButton')}
                    </button>
                  </div>
                )}
                {index === 0 && historicResults.length > 1 && (
                  <div
                    style={{
                      ...styles.largeText,
                      clear: 'both',
                      paddingTop: 40,
                    }}
                  >
                    <div style={styles.resultsHeader}>
                      {I18n.t('resultsPreviousResults')}
                    </div>
                    <div style={styles.resultsHeaderAccuracy}>
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
