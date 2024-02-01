import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';

export default function ExpandedProgressColumnHeader({
  lesson,
  level,
  isLevelExpanded,
  toggleExpandedChoiceLevel,
}) {
  const isExpandable = level.sublevels?.length > 0;

  const expandedChoiceLevel = React.useCallback(
    () => (
      <div
        key={lesson.id + '.' + level.bubbleText + '-h'}
        className={classNames(
          styles.expandedHeaderExpandedLevel,
          isExpandable && styles.pointerMouse
        )}
        onClick={() => toggleExpandedChoiceLevel(level)}
      >
        <div
          className={classNames(
            styles.expandedHeaderLevelCell,
            styles.expandedHeaderExpandedLevelCell
          )}
        >
          {level.sublevels?.length > 0 && (
            <FontAwesome
              icon="caret-down"
              className={styles.expandedHeaderLevelCaret}
            />
          )}
          {lesson.relative_position + '.' + level.bubbleText}
        </div>
        {level.sublevels?.map(sublevel => (
          <div
            className={styles.expandedHeaderLevelCell}
            key={
              lesson.id + '.' + level.bubbleText + '-h-' + sublevel.bubbleText
            }
          >
            {sublevel.bubbleText}
          </div>
        ))}
      </div>
    ),
    [lesson, level, isExpandable, toggleExpandedChoiceLevel]
  );

  const unexpandedLevel = React.useCallback(
    () => (
      <div
        className={classNames(
          styles.gridBox,
          styles.expandedHeaderLevelCell,
          isExpandable && styles.pointerMouse
        )}
        key={lesson.id + '.' + level.bubbleText + '-h'}
        onClick={() => toggleExpandedChoiceLevel(level)}
      >
        {level.sublevels?.length > 0 && (
          <FontAwesome
            icon="caret-right"
            className={styles.expandedHeaderLevelCaret}
          />
        )}
        {lesson.relative_position + '.' + level.bubbleText}
      </div>
    ),
    [lesson, level, toggleExpandedChoiceLevel, isExpandable]
  );

  return level.sublevels?.length > 0 && isLevelExpanded
    ? expandedChoiceLevel()
    : unexpandedLevel();
}

ExpandedProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  level: PropTypes.object.isRequired,
  isLevelExpanded: PropTypes.bool,
  toggleExpandedChoiceLevel: PropTypes.func,
};
