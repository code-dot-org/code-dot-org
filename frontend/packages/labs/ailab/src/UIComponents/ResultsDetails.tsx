import React from 'react';

import {formatAccuracy, getResultsByGrade} from '../helpers/accuracy';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {setResultsTab} from '../redux';

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
  const results = useAppSelector(
    state => getResultsByGrade(state, project, resultsTab),
    deepEqual
  );

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
          {hasPredictions && (
            <>
              <span className={styles.divider} />
              <ResultsToggle
                grade={resultsTab}
                onChange={grade => dispatch(setResultsTab(grade))}
              />
            </>
          )}
        </div>
      </div>
      <ResultsTable results={results} />
    </div>
  );
};

export default ResultsDetails;
