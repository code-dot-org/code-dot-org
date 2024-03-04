import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import LevelProgressHeader from './LevelProgressHeader';
import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';

export default function ExpandedProgressColumnHeader({
  lesson,
  removeExpandedLesson,
  expandedChoiceLevels,
  toggleExpandedChoiceLevel,
}) {
  // If there are 2 or less levels, we only show the number so that the text fits the cell.
  const headerText =
    lesson.levels.length < 3 && expandedChoiceLevels.length === 0
      ? lesson.relative_position
      : lesson.title;

  // Manual width is necessary so that overflow text is hidden and lesson header exactly fits levels.
  // Add (numLevels + 1)px to account for borders.
  // Also count expanded lessons and account for larger borders
  const width = React.useMemo(() => {
    const levelWidth = parseInt(styles.levelCellWidth) + 1;
    const lessonHeaderWidth = lesson.levels.reduce((acc, level) => {
      if (
        level.sublevels?.length > 0 &&
        expandedChoiceLevels.includes(level.id)
      ) {
        return acc + (level.sublevels.length + 1) * levelWidth;
      }
      return acc + levelWidth;
    }, 0);
    return lessonHeaderWidth + 1 + 'px';
  }, [lesson, expandedChoiceLevels]);

  return (
    <div className={styles.expandedHeader} key={lesson.id}>
      <div
        className={classNames(
          styles.gridBox,
          styles.expandedHeaderLessonCell,
          styles.pointerMouse
        )}
        style={{width}}
        onClick={() => removeExpandedLesson(lesson.id)}
        aria-label={headerText}
        data-tip
        data-for={getTooltipId(lesson)}
      >
        <LessonTitleTooltip lesson={lesson} />
        <FontAwesome icon="caret-down" className={styles.expandedHeaderCaret} />
        <div className={styles.expandedHeaderLessonText}>{headerText}</div>
      </div>
      <div className={styles.expandedHeaderSecondRow}>
        {lesson.levels.map(level => (
          <LevelProgressHeader
            key={level.id}
            lesson={lesson}
            level={level}
            isLevelExpanded={expandedChoiceLevels.includes(level.id)}
            toggleExpandedChoiceLevel={toggleExpandedChoiceLevel}
          />
        ))}
      </div>
    </div>
  );
}

ExpandedProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
  expandedChoiceLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleExpandedChoiceLevel: PropTypes.func.isRequired,
};
