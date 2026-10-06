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

  const accuracy = formatAccuracy(currentResult.accuracy);

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
          onClick={() => dispatch(setShowResultsDetails(true))}
        >
          <span className={styles.accuracyIcon}>
            <FontAwesomeV6Icon iconName="calculator" />
          </span>
          <span className={styles.accuracyText}>{accuracy} Accuracy</span>
        </Button>
      </div>
    </div>
  );
};

export default ResultsBar;
