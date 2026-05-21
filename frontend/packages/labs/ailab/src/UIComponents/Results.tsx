/* React component to handle displaying accuracy results. */
import {useEffect, useCallback} from 'react';
import {connect} from 'react-redux';
import {styles} from '../constants';
import {UnconnectedStatement} from './Statement';
import {setShowResultsDetails, setResultsPhase, RootState} from '../redux';
import {Dispatch} from 'redux';
import {HistoricResult} from '../types';
import ResultsDetails from './ResultsDetails';
import ScrollableContent from './ScrollableContent';
import I18n from '../i18n';

interface ResultsProps {
  historicResults: HistoricResult[];
  showResultsDetails: boolean;
  setShowResultsDetails: (show: boolean) => void;
  setResultsPhase: (phase: number) => void;
}

const Results = ({
  historicResults,
  showResultsDetails,
  setShowResultsDetails,
  setResultsPhase,
}: ResultsProps) => {
  useEffect(() => {
    setResultsPhase(0);
    const timer = setTimeout(() => {
      setResultsPhase(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [setResultsPhase]);

  const showDetails = useCallback(() => {
    setShowResultsDetails(true);
  }, [setShowResultsDetails]);

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

export default connect(
  (state: RootState) => ({
    historicResults: state.historicResults,
    showResultsDetails: state.showResultsDetails,
  }),
  (dispatch: Dispatch) => ({
    setResultsPhase(phase: number) {
      dispatch(setResultsPhase(phase));
    },
    setShowResultsDetails(show: boolean) {
      dispatch(setShowResultsDetails(show));
    },
  }),
)(Results);
