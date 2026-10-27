import {useMemo} from 'react';

import type {Grade} from './helpers/displayTreeNodeContent';
import type {DisplayTreeNodeCounts} from './helpers/displayTreeTrace';
import type {TableView} from './types';

// The view spans every grade, so each grade's count follows the filter.
export function useGradedView<View extends TableView>(
  view: View,
  rowsByGrade: Record<Grade, number[]> | undefined,
  grade: Grade
): {view: View; counts?: DisplayTreeNodeCounts} {
  const {rows} = view;
  const graded = useMemo(() => {
    if (!rowsByGrade) {
      return undefined;
    }
    const matchingRows = (rowGrade: Grade) => {
      const gradeRows = new Set(rowsByGrade[rowGrade]);
      return rows.filter(row => gradeRows.has(row));
    };
    const matching = {
      correct: matchingRows('correct'),
      incorrect: matchingRows('incorrect'),
    };
    return {
      rows: matching[grade],
      totalRowCount: rowsByGrade[grade].length,
      counts: {
        correct: matching.correct.length,
        incorrect: matching.incorrect.length,
      },
    };
  }, [rows, rowsByGrade, grade]);
  if (!graded) {
    return {view};
  }
  const {counts, ...gradeView} = graded;
  return {view: {...view, ...gradeView}, counts};
}
