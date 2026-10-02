/* React component to handle displaying accuracy results. */
import classNames from 'classnames';
import {useCallback} from 'react';

import {CANVAS_OVERLAY_WIDTH} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setShowResultsDetails} from '../redux';
import {getDisplayTree} from '../selectors/visualizationSelectors';
import type {HistoricResult} from '../types';

import DecisionTree from './DecisionTree';
import ResultsDetails from './ResultsDetails';
import {UnconnectedStatement} from './Statement';
import TestPanel from './TestPanel';

import shared from '../shared.module.scss';
import styles from './results.module.scss';

const Results = () => {
  const historicResults = useAppSelector(state => state.historicResults);
  const showResultsDetails = useAppSelector(state => state.showResultsDetails);
  const hasTree = useAppSelector(state => !!getDisplayTree(state));
  const dispatch = useAppDispatch();

  const showDetails = useCallback(() => {
    dispatch(setShowResultsDetails(true));
  }, [dispatch]);

  const [currentResult, ...previousResults] = historicResults;

  const resultRow = (result: HistoricResult, index: number) => (
    <div key={index} className={styles.result}>
      <div className={styles.statement}>
        <UnconnectedStatement
          shouldShow={true}
          smallFont={true}
          labelColumn={result.label}
          selectedFeatures={result.features}
        />
      </div>
      <div className={classNames(styles.accuracy, shared.bold)}>
        {result.accuracy}%
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
    </div>
  );

  return (
    <div className={styles.container}>
      {showResultsDetails && <ResultsDetails />}

      <div id="results" className={shared.panel}>
        <div className={shared.largeText}>
          <div className={styles.heading}>{I18n.t('resultsHeader')}</div>
          <div className={styles.accuracyHeading}>
            {I18n.t('resultsAccuracy')}
          </div>
        </div>
        {currentResult && resultRow(currentResult, 0)}
        {hasTree ? (
          <DecisionTree overlay={<TestPanel />} />
        ) : (
          <div
            className={styles.testPanelSlot}
            style={{width: CANVAS_OVERLAY_WIDTH}}
          >
            <TestPanel />
          </div>
        )}
        {previousResults.length > 0 && (
          <div className={styles.previousResults}>
            <div className={shared.largeText}>
              <div className={styles.heading}>
                {I18n.t('resultsPreviousResults')}
              </div>
              <div className={styles.accuracyHeading}>
                {I18n.t('resultsAccuracy')}
              </div>
            </div>
            {previousResults.map((result, index) =>
              resultRow(result, index + 1),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
