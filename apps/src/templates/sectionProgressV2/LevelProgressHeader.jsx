import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '../FontAwesome';

import styles from './progress-table-v2.module.scss';

export default function ExpandedProgressColumnHeader({
  lesson,
  level,
  isLevelExpanded,
  toggleExpandedChoiceLevel,
}) {
  const isExpandable = level.sublevels?.length > 0;

  const expandedChoiceLevel = React.useCallback(
    () => (
      <tbody
        key={lesson.id + '.' + level.id + '-h'}
        className={classNames(
          styles.expandedHeaderChild,
          styles.expandedHeaderExpandedLevel,
          isExpandable && styles.pointerMouse
        )}
        onClick={() => toggleExpandedChoiceLevel(level)}
      >
        <th
          className={classNames(
            styles.gridBox,
            styles.expandedHeaderLevelCell,
            styles.expandedHeaderExpandedLevelCell
          )}
          scope="col"
          id={'lvl-' + level.id}
        >
          {level.sublevels?.length > 0 && <FontAwesome icon="caret-down" />}
          <div className={styles.expandedHeaderLevelCellLevelNumber}>
            {lesson.relative_position + '.' + level.bubbleText}
          </div>
          {level.kind === 'assessment' && (
            <FontAwesome
              icon="star"
              aria-label="assessment"
              className={styles.assessmentLevelIcon}
            />
          )}
        </th>
        {level.sublevels?.map(sublevel => (
          <th
            className={classNames(
              styles.gridBox,
              styles.expandedHeaderLevelCell,
              styles.expandedHeaderExpandedLevelCell
            )}
            key={lesson.id + '.' + level.id + '-h-' + sublevel.id}
            scope="col"
            id={'lvl-' + level.id + '.' + sublevel.id}
          >
            <div className={styles.expandedHeaderLevelCellLevelNumber}>
              {sublevel.bubbleText}
            </div>
          </th>
        ))}
      </tbody>
    ),
    [lesson, level, isExpandable, toggleExpandedChoiceLevel]
  );

  const unexpandedLevel = React.useCallback(
    () => (
      <th
        className={classNames(
          styles.gridBox,
          styles.expandedHeaderChild,
          styles.expandedHeaderLevelCell,
          styles.expandedHeaderLevelCellUnexpanded,
          isExpandable && styles.pointerMouse
        )}
        key={lesson.id + '.' + level.id + '-h'}
        onClick={() => toggleExpandedChoiceLevel(level)}
        id={'lvl-' + level.id}
      >
        {level.sublevels?.length > 0 && <FontAwesome icon="caret-right" />}
        <div className={styles.expandedHeaderLevelCellLevelNumber}>
          {`${lesson.relative_position}.${
            level.isUnplugged ? 0 : level.bubbleText
          }`}
        </div>
        {level.kind === 'assessment' && (
          <FontAwesome
            icon="star"
            aria-label="assessment"
            className={styles.assessmentLevelIcon}
          />
        )}
      </th>
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
