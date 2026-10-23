import React, {useMemo, useState} from 'react';

import {
  formatAccuracy,
  getAccuracyGrades,
  getAllResults,
} from '../helpers/accuracy';
import {dataColumnsFor} from '../helpers/columnDetails';
import type {Grade} from '../helpers/displayTreeNodeContent';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {setResultsTab} from '../redux';
import {useGradedView} from '../useGradedView';
import {useResultsTableView} from '../useResultsTableView';

import ColumnsButton from './ColumnsButton';
import PredictionSentence from './PredictionSentence';
import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';
import TableFilter from './TableFilter';

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
    state => getAllResults(state, project),
    deepEqual
  );
  const grades = useAppSelector(state => getAccuracyGrades(state, project));
  const rowsByGrade = useMemo(() => {
    const byGrade: Record<Grade, number[]> = {correct: [], incorrect: []};
    grades.forEach((grade, row) => byGrade[grade as Grade].push(row));
    return byGrade;
  }, [grades]);
  const columns = useMemo(
    () => dataColumnsFor(data, project, showAllColumns),
    [data, project, showAllColumns]
  );
  const {view, counts} = useGradedView(
    useResultsTableView(results, columns),
    rowsByGrade,
    resultsTab as Grade
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
          <span className={styles.divider} />
          <div className={styles.actionGroup}>
            {hasPredictions && (
              <ResultsToggle
                grade={resultsTab}
                onChange={grade => dispatch(setResultsTab(grade))}
                counts={counts}
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
      <ResultsTable results={results} columns={columns} view={view} />
    </div>
  );
};

export default ResultsDetails;
