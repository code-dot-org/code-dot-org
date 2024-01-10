import React from 'react';
import PropTypes from 'prop-types';
import SortByNameDropdown from '../SortByNameDropdown';
import styles from './progress-header.module.scss';
import gridStyles from './progress-table-v2.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import classNames from 'classnames';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

export default function ProgressTableHeader({unitName, sectionId, lessons}) {
  const getLessonColumnHeader = lesson => {
    return (
      <div
        className={classNames(
          gridStyles.gridBox,
          gridStyles.gridBoxLessonHeader
        )}
        key={lesson.id}
      >
        {lesson.relative_position}
      </div>
    );
  };

  return (
    <div className={styles.header}>
      <div className={styles.sortDropdown}>
        <Heading6 className={styles.studentHeading}>Students</Heading6>
        <SortByNameDropdown
          sectionId={sectionId}
          unitName={unitName}
          source={SECTION_PROGRESS_V2}
        />
      </div>
      <div className={styles.columnHeaders}>
        {lessons.map(lesson => getLessonColumnHeader(lesson))}
      </div>
    </div>
  );
}

ProgressTableHeader.propTypes = {
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
  lessons: PropTypes.array,
};
