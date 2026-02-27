import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {FEEDBACK_TYPE} from './AiFeedbackType';

import styles from './summary.module.scss';

type FreeResponseSummaryDataBoxProps = {
  totalStudentCount: number;
  proficientStudentCount: number;
  needsRevisionStudentCount: number;
  flaggedStudentCount: number;
  noResponseStudentCount: number;
};

const FreeResponseSummaryDataBox: React.FC<FreeResponseSummaryDataBoxProps> = ({
  totalStudentCount,
  proficientStudentCount,
  needsRevisionStudentCount,
  flaggedStudentCount,
  noResponseStudentCount,
}) => {
  const generateData = (
    studentCount: number,
    label: string,
    icon: string,
    classname: string
  ): JSX.Element => {
    const percent: number = Math.round(
      (studentCount / totalStudentCount) * 100
    );
    return (
      <div className={styles.group}>
        <FontAwesomeV6Icon
          iconName={icon}
          className={classNames(styles.icon, classname)}
        />
        <Typography className={styles.labelText} variant="body3" gutterBottom>
          {`${label}: ${studentCount}`}
        </Typography>
        <Typography className={styles.labelText} variant="body3" gutterBottom>
          <strong>{`(${percent}%)`}</strong>
        </Typography>
      </div>
    );
  };

  return (
    <div className={styles.aiDataContainer}>
      {generateData(
        proficientStudentCount,
        FEEDBACK_TYPE.PROFICIENT.label,
        FEEDBACK_TYPE.PROFICIENT.icon,
        styles.proficientIcon
      )}
      {generateData(
        needsRevisionStudentCount,
        FEEDBACK_TYPE.NOT_PROFICIENT.label,
        FEEDBACK_TYPE.NOT_PROFICIENT.icon,
        styles.needsReviewIcon
      )}
      {generateData(
        noResponseStudentCount,
        FEEDBACK_TYPE.NO_ATTEMPT.label,
        FEEDBACK_TYPE.NO_ATTEMPT.icon,
        styles.noAttemptIcon
      )}
      {generateData(
        flaggedStudentCount,
        FEEDBACK_TYPE.FLAGGED.label,
        FEEDBACK_TYPE.FLAGGED.icon,
        styles.flaggedIcon
      )}
    </div>
  );
};

export default FreeResponseSummaryDataBox;
