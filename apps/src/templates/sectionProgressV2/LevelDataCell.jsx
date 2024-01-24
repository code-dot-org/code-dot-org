import PropTypes from 'prop-types';
import React from 'react';
import {studentLevelProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';

export default function LevelDataCell({level, studentLevelProgress}) {
  const levelData = React.useMemo(() => {
    if (!studentLevelProgress) {
      return;
    }
    return studentLevelProgress.status;
  }, [studentLevelProgress]);

  return (
    <div className={classNames(styles.gridBox, styles.gridBoxLevel)}>
      {levelData}
    </div>
  );
}

LevelDataCell.propTypes = {
  studentId: PropTypes.number.isRequired,
  studentLevelProgress: studentLevelProgressType,
  level: PropTypes.object.isRequired,
};
