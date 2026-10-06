import {
  formatAccuracy,
  getPercentCorrect,
  getResultsByGrade,
} from '../helpers/accuracy';
import {deepEqual, useAppSelector} from '../hooks';

import PredictionSentence from './PredictionSentence';
import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

import styles from './resultsDetails.module.scss';

const ResultsDetails = () => {
  const currentResult = useAppSelector(state => state.historicResults[0]);
  const percentCorrect = useAppSelector(getPercentCorrect);
  const results = useAppSelector(
    state => getResultsByGrade(state, state.resultsTab),
    deepEqual,
  );

  return (
    <div className={styles.details}>
      {currentResult && (
        <div className={styles.modelRow}>
          <PredictionSentence
            label={currentResult.label}
            features={currentResult.features}
            size="m"
            className={styles.sentence}
          />
          <div className={styles.summary}>
            <span className={styles.accuracy}>
              {formatAccuracy(currentResult.accuracy)} Accuracy
            </span>
            {!isNaN(Number(percentCorrect)) && (
              <>
                <span className={styles.divider} />
                <ResultsToggle />
              </>
            )}
          </div>
        </div>
      )}
      <ResultsTable results={results} />
    </div>
  );
};

export default ResultsDetails;
