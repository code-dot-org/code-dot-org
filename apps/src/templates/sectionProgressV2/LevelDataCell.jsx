import PropTypes from 'prop-types';
import React from 'react';
import {studentLevelProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import queryString from 'query-string';
import {Link} from '@dsco_/link';

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
      external
      className={classNames(styles.gridBox, styles.gridBoxLevel)}
    >
      {levelData}
    </Link>
  );
}

LevelDataCell.propTypes = {
  studentId: PropTypes.number,
  sectionId: PropTypes.number,
  studentLevelProgress: studentLevelProgressType,
  level: PropTypes.object.isRequired,
};
