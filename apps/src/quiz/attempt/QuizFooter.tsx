import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './quiz-footer.module.scss';

export interface QuizFooterProps {
  // 1-based index of the page currently on screen.
  currentPageNumber: number;
  totalPages: number;
  onNavigateToPage: (pageNumber: number) => void;
  onNext: () => void;
}

// Always visible during an attempt, even for a single-question quiz - back
// and pagination hide themselves via isFirstPage/hasPagination below, but
// Submit/Next stays.
const QuizFooter: React.FunctionComponent<QuizFooterProps> = ({
  currentPageNumber,
  totalPages,
  onNavigateToPage,
  onNext,
}) => {
  const isFirstPage = currentPageNumber === 1;
  const isLastPage = currentPageNumber === totalPages;
  const hasPagination = totalPages > 1;

  const paginationButtons = Array.from({length: totalPages}, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  return (
    <div className={styles.footer}>
      <div className={styles.side}>
        {!isFirstPage && (
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            type="button"
            startIcon={<FontAwesomeV6Icon iconName="arrow-left" />}
            onClick={() => onNavigateToPage(currentPageNumber - 1)}
          >
            Back
          </MuiButton>
        )}
      </div>

      {hasPagination && (
        <SegmentedButtons
          className={styles.pagination}
          type="number"
          size="s"
          selectedButtonValue={String(currentPageNumber)}
          onChange={value => onNavigateToPage(Number(value))}
          buttons={paginationButtons}
        />
      )}

      <div className={classNames(styles.side, styles.sideEnd)}>
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          type="button"
          endIcon={!isLastPage && <FontAwesomeV6Icon iconName="arrow-right" />}
          onClick={onNext}
        >
          {isLastPage ? 'Finish' : 'Next'}
        </MuiButton>
      </div>
    </div>
  );
};

export default QuizFooter;
