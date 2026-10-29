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
import {getData, getIdColumn} from '../selectors';
import {useGradedView} from '../useGradedView';
import {useResultsTableView} from '../useResultsTableView';

import PredictionSentence from './PredictionSentence';
import ResultsTable from './ResultsTable';
import ResultsToggle from './ResultsToggle';
import TableActionRow from './TableActionRow';

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
  const data = useAppSelector(getData);
  const idColumn = useAppSelector(getIdColumn);
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
    () => dataColumnsFor(data, project, showAllColumns, idColumn),
    [data, project, showAllColumns, idColumn]
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
        <span className={styles.accuracy}>
          {formatAccuracy(currentResult.accuracy)} Accuracy
        </span>
      </div>
      <ResultsTable
        results={results}
        columns={columns}
        view={view}
        actionRow={
          <TableActionRow
            view={view}
            showAllColumns={showAllColumns}
            onToggleColumns={() => setShowAllColumns(shown => !shown)}
          >
            {hasPredictions && (
              <ResultsToggle
                grade={resultsTab}
                onChange={grade => dispatch(setResultsTab(grade))}
                counts={counts}
              />
            )}
          </TableActionRow>
        }
      />
    </div>
  );
};

export default ResultsDetails;
