import PropTypes from 'prop-types';
import React from 'react';
import {studentLevelProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import FontAwesome from '../FontAwesome';

export default function LevelDataCell({
  level,
  studentLevelProgress,
  overrideIcon,
}) {
  const levelData = React.useMemo(() => {
    if (!studentLevelProgress) {
      return;
    }
    return studentLevelProgress.status;
  }, [studentLevelProgress]);

  return (
    <div className={classNames(styles.gridBox, styles.gridBoxLevel)}>
      {overrideIcon ? <FontAwesome icon={overrideIcon} /> : levelData}
    </div>
  );
}

LevelDataCell.propTypes = {
  studentId: PropTypes.number.isRequired,
  studentLevelProgress: studentLevelProgressType,
  level: PropTypes.object.isRequired,
  overrideIcon: PropTypes.string,
};
