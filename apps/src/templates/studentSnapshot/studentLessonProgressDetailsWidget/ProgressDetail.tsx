import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './studentLessonProgressDetailsWidget.module.scss';

interface ProgressDetailProps {
  detailTitle: string;
  detailIconName: string;
  selectedStudentDetail: string;
  classAvgDetail: string;
  displayStudentDetailAsComplete: boolean;
  showAvgComparisonArrow: boolean;
  studentIsAboveClassAvg: boolean;
}

const ProgressDetail: React.FC<ProgressDetailProps> = ({
  detailTitle,
  detailIconName,
  selectedStudentDetail,
  classAvgDetail,
  displayStudentDetailAsComplete,
  showAvgComparisonArrow,
  studentIsAboveClassAvg,
}) => (
  <div className={styles.lessonDetail}>
    <FontAwesomeV6Icon iconName={detailIconName} iconStyle={'regular'} />
    <div
      className={classNames(
        styles.lessonDetailLabelAndInfo,
        displayStudentDetailAsComplete && styles.greenCompletedText
      )}
    >
      <Typography variant="overline3">{detailTitle}</Typography>
      <Typography variant="h4">{selectedStudentDetail}</Typography>
      <div
        className={classNames(
          styles.classAvgInfo,
          studentIsAboveClassAvg ? styles.aboveClassAvg : styles.belowClassAvg
        )}
      >
        <Typography variant="body4">{classAvgDetail}</Typography>
        {showAvgComparisonArrow && (
          <FontAwesomeV6Icon
            iconName={studentIsAboveClassAvg ? 'arrow-up' : 'arrow-down'}
            iconStyle={'regular'}
          />
        )}
      </div>
    </div>
  </div>
);

export default ProgressDetail;
