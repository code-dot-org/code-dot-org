import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import i18n from '@cdo/locale';

export default function ExpandedProgressColumnHeader({
  lesson,
  removeExpandedLesson,
}) {
  // If there are only 2 levels, we only show the number so that the text fits the cell.
  const headerText =
    lesson.levels.length < 3
      ? lesson.relative_position
      : i18n.lessonNumbered({
          lessonNumber: lesson.relative_position,
          lessonName: lesson.name,
        });

  // Manual width is necessary so that overflow text is hidden and lesson header exactly fits levels.
  // Add (numLevels + 1)px to account for borders.
  const width =
    lesson.levels.length * styles.levelCellWidth +
    lesson.levels.length +
    1 +
    'px';

  return (
    <div className={styles.expandedHeader}>
      <div
        className={classNames(styles.gridBox, styles.expandedHeaderLessonCell)}
        style={{width}}
        onClick={() => removeExpandedLesson(lesson.id)}
        aria-label={headerText}
      >
        <FontAwesome icon="caret-down" className={styles.expandedHeaderCaret} />
        <div className={styles.expandedHeaderLessonText}>{headerText}</div>
      </div>
      <div className={styles.expandedHeaderSecondRow}>
        {lesson.levels.map(level => (
          <div
            className={classNames(
              styles.gridBox,
              styles.expandedHeaderLevelCell
            )}
            key={lesson.id + '.' + level.bubbleText + '-h'}
          >
            {lesson.relative_position + '.' + level.bubbleText}
          </div>
        ))}
      </div>
    </div>
  );
}

ExpandedProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
};
