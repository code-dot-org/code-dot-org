import {Button} from '@mui/material';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {formatAccuracy} from '../helpers/accuracy';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setShowResultsDetails} from '../redux';

import PredictionSentence from './PredictionSentence';
import ResultsModal, {type ResultsModalTab} from './ResultsModal';

import styles from './resultsBar.module.scss';

const ResultsBar = () => {
  const dispatch = useAppDispatch();
  const currentResult = useAppSelector(state => state.historicResults[0]);
  const showResults = useAppSelector(state => state.showResultsDetails);
  const [resultsTab, setResultsTab] = useState<ResultsModalTab>('scorecard');

  if (!currentResult) {
    return null;
  }

  const accuracy = formatAccuracy(currentResult.accuracy);

  const openResults = (tab: ResultsModalTab) => {
    setResultsTab(tab);
    dispatch(setShowResultsDetails(true));
  };

  return (
    <div className={styles.bar}>
      <PredictionSentence
        label={currentResult.label}
        features={currentResult.features}
        size="m"
      />
      <div className={styles.buttons}>
        <Button
          id="uitest-details-button"
          variant="outlined"
          color="secondary"
          size="extraSmall"
          className={styles.accuracyButton}
          aria-label={`View ${accuracy} Accuracy details`}
          onClick={() => openResults('scorecard')}
        >
          <span className={styles.accuracyIcon}>
            <FontAwesomeV6Icon iconName="calculator" />
          </span>
          <span className={styles.accuracyText}>{accuracy} Accuracy</span>
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="clock-rotate-left" />}
          onClick={() => openResults('previousResults')}
        >
          Previous results
        </Button>
      </div>
      {showResults && (
        <ResultsModal
          initialTab={resultsTab}
          onClose={() => dispatch(setShowResultsDetails(false))}
        />
      )}
    </div>
  );
};

export default ResultsBar;
