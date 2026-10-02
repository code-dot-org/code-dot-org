/* The test page's top bar: what the model predicts, and how accurate it is. */
import {Button} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {formatAccuracy} from '../helpers/accuracy';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setShowResultsDetails} from '../redux';

import PredictionSentence from './PredictionSentence';

import styles from './resultsBar.module.scss';

const ResultsBar = () => {
  const dispatch = useAppDispatch();
  const currentResult = useAppSelector(state => state.historicResults[0]);

  if (!currentResult) {
    return null;
  }

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
          onClick={() => dispatch(setShowResultsDetails(true))}
        >
          <span className={styles.accuracyIcon}>
            <FontAwesomeV6Icon iconName="calculator" />
          </span>
          <span className={styles.accuracyText}>
            {formatAccuracy(currentResult.accuracy)} Accuracy
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ResultsBar;
