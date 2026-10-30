import {renderHook} from '@testing-library/react-hooks';

import {useGradedView} from '@cdo/apps/ailab/engine/useGradedView';

const ROWS_BY_GRADE = {correct: [0, 2, 3], incorrect: [1]};
const FILTERED_VIEW = {rows: [2, 1], totalRowCount: 4};

describe('useGradedView', () => {
  test('a grade shows its filtered rows and counts each grade after the filter', () => {
    const {result, rerender} = renderHook(
      ({grade}) => useGradedView(FILTERED_VIEW, ROWS_BY_GRADE, grade),
      {initialProps: {grade: 'correct'}}
    );

    expect(result.current.view.rows).toEqual([2]);
    expect(result.current.view.totalRowCount).toBe(3);
    expect(result.current.counts).toEqual({correct: 1, incorrect: 1});

    rerender({grade: 'incorrect'});
    expect(result.current.view.rows).toEqual([1]);
    expect(result.current.view.totalRowCount).toBe(1);
  });

  test('passes the view through when there are no grades', () => {
    const {result} = renderHook(() =>
      useGradedView(FILTERED_VIEW, undefined, 'correct')
    );

    expect(result.current).toEqual({view: FILTERED_VIEW});
  });
});
