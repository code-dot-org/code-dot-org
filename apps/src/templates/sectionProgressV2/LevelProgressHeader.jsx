import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '../FontAwesome';

import {getLevelColumnHeaderId} from './LevelDataCell';

import styles from './progress-table-v2.module.scss';

export default function ExpandedProgressColumnHeader({
  lesson,
  level,
  isLevelExpanded,
  toggleExpandedChoiceLevel,
}) {
  const isExpandable = level.sublevels?.length > 0;

  const getLevelHeaderContent = React.useCallback(
    () => (
      <>
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
      </>
    ),
    [lesson, level]
  );

  const expandedLevel = React.useCallback(
    icon => (
      <button
        type="button"
        className={styles.expandedHeaderLevelCellExpandable}
      >
        {<FontAwesome icon={icon} />}
        {getLevelHeaderContent()}
      </button>
    ),
    [getLevelHeaderContent]
  );

  const expandedChoiceLevel = React.useCallback(
    () => (
      <>
        <th
          className={classNames(
            styles.gridBox,
            styles.expandedHeaderLevelCell,
            styles.expandedHeaderExpandedLevelCell,
            styles.expandedHeaderExpandedLevelCellFirst,
            isExpandable && styles.pointerMouse
          )}
          scope="col"
          id={getLevelColumnHeaderId(level.id)}
          onClick={() => toggleExpandedChoiceLevel(level)}
        >
          {level.sublevels?.length > 0
            ? expandedLevel('caret-down')
            : getLevelHeaderContent()}
        </th>
        {level.sublevels?.map((sublevel, index) => (
          <th
            className={classNames(
              styles.gridBox,
              styles.expandedHeaderLevelCell,
              styles.expandedHeaderExpandedLevelCell
            )}
            key={lesson.id + '.' + level.id + '-h-' + sublevel.id}
            scope="col"
            id={getLevelColumnHeaderId(sublevel.id, level.id)}
          >
            <div className={styles.expandedHeaderExpandedLevelCellInner}>
              <div className={styles.expandedHeaderLevelCellLevelNumber}>
                {sublevel.bubbleText}
              </div>
            </div>
          </th>
        ))}
      </>
    ),
    [
      lesson,
      level,
      isExpandable,
      toggleExpandedChoiceLevel,
      expandedLevel,
      getLevelHeaderContent,
    ]
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
        id={getLevelColumnHeaderId(level.id)}
      >
        {level.sublevels?.length > 0
          ? expandedLevel('caret-right')
          : getLevelHeaderContent()}
      </th>
    ),
    [
      lesson,
      level,
      toggleExpandedChoiceLevel,
      isExpandable,
      expandedLevel,
      getLevelHeaderContent,
    ]
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
