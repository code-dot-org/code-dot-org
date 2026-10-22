import React, {useMemo, useState} from 'react';

import {ResultsGrades} from '../constants';
import {
  formatAccuracy,
  getAccuracyGrades,
  getResultsByGrade,
} from '../helpers/accuracy';
import {dataColumnsFor} from '../helpers/columnDetails';
import type {Grade} from '../helpers/displayTreeNodeContent';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {setResultsTab} from '../redux';
import {viewForGrade} from '../useTableView';

import ColumnsButton from './ColumnsButton';
import PredictionSentence from './PredictionSentence';
import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';
import TableFilter from './TableFilter';
import {useResultsTableView} from './useResultsTableView';

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
  const data = useAppSelector(state => state.data);
  const results = useAppSelector(
    state => getResultsByGrade(state, project, ResultsGrades.ALL),
    deepEqual
  );
  const grades = useAppSelector(state => getAccuracyGrades(state, project));
  const rowsByGrade = useMemo(() => {
    const indices = [...grades.keys()];
    return {
      correct: indices.filter(index => grades[index] === ResultsGrades.CORRECT),
      incorrect: indices.filter(
        index => grades[index] === ResultsGrades.INCORRECT
      ),
    };
  }, [grades]);
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns),
    [data, project, showAllColumns]
  );
  const view = useResultsTableView(results, columns);
  const graded = viewForGrade(view, rowsByGrade, resultsTab as Grade);

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
                counts={graded.counts}
              />
            )}
            <TableFilter view={view} />
            <ColumnsButton
              showAllColumns={showAllColumns}
              onToggle={() => setShowAllColumns(shown => !shown)}
            />
          </div>
        </div>
      </div>
      <ResultsTable results={results} columns={columns} view={graded.view} />
    </div>
  );
};

export default ResultsDetails;
