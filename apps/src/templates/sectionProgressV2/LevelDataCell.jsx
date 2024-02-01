import PropTypes from 'prop-types';
import React from 'react';
import {studentLevelProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import FontAwesome from '../FontAwesome';
import queryString from 'query-string';
import {Link} from '@dsco_/link';

export const LEVEL_DATA_CELL_TEST_ID = 'level-data-cell';
export const LEVEL_OVERRIDE_ICON_TEST_TITLE = 'override-icon-';

const navigateToLevelOverviewUrl = (levelUrl, studentId, sectionId) => {
  if (!levelUrl) {
    return null;
  }
  const params = {};

  if (sectionId) {
    params.section_id = sectionId;
  }
  if (studentId) {
    params.user_id = studentId;
  }
  if (Object.keys(params).length) {
    return `${levelUrl}?${queryString.stringify(params)}`;
  }
  return levelUrl;
};

export default function LevelDataCell({
  level,
  studentId,
  sectionId,
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
    <Link
      href={navigateToLevelOverviewUrl(level.url, studentId, sectionId)}
      openInNewTab
      data-testid={LEVEL_DATA_CELL_TEST_ID}
      external
      className={classNames(styles.gridBox, styles.gridBoxLevel)}
    >
      {overrideIcon ? (
        <FontAwesome
          icon={overrideIcon}
          title={LEVEL_OVERRIDE_ICON_TEST_TITLE + overrideIcon}
        />
      ) : (
        levelData
      )}
    </Link>
  );
}

LevelDataCell.propTypes = {
  studentId: PropTypes.number,
  sectionId: PropTypes.number,
  studentLevelProgress: studentLevelProgressType,
  level: PropTypes.object.isRequired,
  overrideIcon: PropTypes.string,
};
