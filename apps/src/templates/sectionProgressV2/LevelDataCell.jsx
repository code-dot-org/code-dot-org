import PropTypes from 'prop-types';
import React from 'react';
import {studentLevelProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import FontAwesome from '../FontAwesome';

export const LEVEL_DATA_CELL_TEST_ID = 'level-data-cell';
export const LEVEL_OVERRIDE_ICON_TEST_TITLE = 'override-icon-';

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
    <div
      className={classNames(styles.gridBox, styles.gridBoxLevel)}
      data-testid={LEVEL_DATA_CELL_TEST_ID}
    >
      {overrideIcon ? (
        <FontAwesome
          icon={overrideIcon}
          title={LEVEL_OVERRIDE_ICON_TEST_TITLE + overrideIcon}
        />
      ) : (
        levelData
      )}
    </div>
  );
}

LevelDataCell.propTypes = {
  studentId: PropTypes.number.isRequired,
  studentLevelProgress: studentLevelProgressType,
  level: PropTypes.object.isRequired,
  overrideIcon: PropTypes.string,
};
