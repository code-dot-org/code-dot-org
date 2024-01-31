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
  const onClick = React.useCallback(() => {
    if (level.sublevels?.length > 0) {
      toggleExpandedChoiceLevel(level.id);
    }
  }, [level, toggleExpandedChoiceLevel]);

  console.log(lesson.id + '.' + level.bubbleText + '-h');
  const expandedChoiceLevel = React.useCallback(
    () => (
      <div
        key={lesson.id + '.' + level.id + '-h'}
        className={styles.expandedHeaderExpandedLevel}
        onClick={onClick}
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
            className={classNames(
              styles.expandedHeaderLevelCell,
              styles.expandedHeaderExpandedLevelCell
            )}
            key={lesson.id + '.' + level.id + '-h-' + sublevel.id}
          >
            {sublevel.bubbleText}
          </div>
        ))}
      </div>
    ),
    [lesson, level, onClick]
  );

  const unexpandedLevel = React.useCallback(
    () => (
      <div
        className={classNames(styles.gridBox, styles.expandedHeaderLevelCell)}
        key={lesson.id + '.' + level.id + '-h'}
        onClick={onClick}
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
    [lesson, level, onClick]
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
