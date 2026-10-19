import React, {useState} from 'react';

import {
  formatAccuracy,
  getCorrectCount,
  getResultsByGrade,
} from '../helpers/accuracy';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {setResultsTab} from '../redux';

import ColumnsButton from './ColumnsButton';
import PredictionSentence from './PredictionSentence';
import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';

import styles from './resultsDetails.module.scss';

const ResultsDetails = () => {
  const {project} = useProject();
  const currentResult = project.historicResults[0];
  const hasPredictions = useAppSelector(
    state => state.accuracyCheckPredictedLabels.length > 0
  );
  const resultsTab = useAppSelector(state => state.resultsTab);
  const dispatch = useAppDispatch();
  const [showAllColumns, setShowAllColumns] = useState(false);
  const results = useAppSelector(
    state => getResultsByGrade(state, project, resultsTab),
    deepEqual
  );
  const gradeCounts = useAppSelector(state => {
    const {correct, total} = getCorrectCount(state, project);
    return {correct, incorrect: total - correct};
  }, deepEqual);

  return (
    <div className={styles.details}>
      <div className={styles.modelRow}>
        <PredictionSentence
          label={currentResult.label}
          features={currentResult.features}
          size="m"
          singleLine
          className={styles.sentence}
        />
        <div className={styles.summary}>
          <span className={styles.accuracy}>
            {formatAccuracy(currentResult.accuracy)} Accuracy
          </span>
          <span className={styles.divider} />
          <div className={styles.actionGroup}>
            {hasPredictions && (
              <ResultsToggle
                grade={resultsTab}
                onChange={grade => dispatch(setResultsTab(grade))}
                counts={gradeCounts}
              />
            )}
            <ColumnsButton
              showAllColumns={showAllColumns}
              onToggle={() => setShowAllColumns(shown => !shown)}
            />
          </div>
        </div>
      </div>
      <ResultsTable results={results} showAllColumns={showAllColumns} />
    </div>
  );
};

export default ResultsDetails;
