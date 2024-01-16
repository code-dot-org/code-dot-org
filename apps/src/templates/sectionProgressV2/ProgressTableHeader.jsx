import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';

export default function ProgressTableHeader({lessons}) {
  const getLessonColumnHeader = lesson => {
    return (
      <div
        className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
        key={lesson.id}
      >
        {lesson.relative_position}
      </div>
    );
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerColumns}>
        {lessons.map(lesson => getLessonColumnHeader(lesson))}
      </div>
    </div>
  );
}

ProgressTableHeader.propTypes = {
  lessons: PropTypes.array.isRequired,
};
