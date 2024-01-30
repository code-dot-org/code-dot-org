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
  const onClick = () => {
    if (level.sublevels?.length > 0) {
      toggleExpandedChoiceLevel(level.id);
    }
  };

  // Todo: refactor into better optimized component, probably two functions with switch
  if (level.sublevels?.length > 0 && isLevelExpanded) {
    return (
      <div
        key={lesson.id + '.' + level.bubbleText + '-h'}
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
            className={styles.expandedHeaderLevelCell}
            key={
              lesson.id + '.' + level.bubbleText + '-h-' + sublevel.bubbleText
            }
          >
            {sublevel.bubbleText}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.gridBox, styles.expandedHeaderLevelCell)}
      key={lesson.id + '.' + level.bubbleText + '-h'}
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
  );
}

ExpandedProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  level: PropTypes.object.isRequired,
  isLevelExpanded: PropTypes.bool,
  toggleExpandedChoiceLevel: PropTypes.func,
};
