import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';

export default function ExpandedProgressColumnHeader({
  lesson,
  level,
  isLevelExpanded,
  toggleExpandedLevel,
}) {
  if (isLevelExpanded) {
    <div
      key={lesson.id + '.' + level.bubbleText + '-h'}
      className={styles.expandedHeaderLevel}
      onClick={onClick}
    >
      <div
        className={classNames(styles.gridBox, styles.expandedHeaderLevelCell)}
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
          className={classNames(styles.gridBox, styles.expandedHeaderLevelCell)}
          key={lesson.id + '.' + level.bubbleText + '-h-' + sublevel.letter}
        >
          {sublevel.letter}
        </div>
      ))}
    </div>;
  }

  const onClick = () => {
    if (level.sublevels?.length > 0) {
      toggleExpandedLevel(lesson.id, level.id);
    }
  };

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
  toggleExpandedLevel: PropTypes.func,
};
