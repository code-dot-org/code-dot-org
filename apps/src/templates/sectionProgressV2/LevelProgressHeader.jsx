import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FontAwesome from '../FontAwesome';
import {toggleExpandedChoiceLevel} from '../sectionProgress/sectionProgressRedux';

import {getLevelColumnHeaderId} from './LevelDataCell';

import styles from './progress-table-v2.module.scss';

function LevelProgressHeader({
  lesson,
  level,
  isLevelExpanded,
  toggleExpandedChoiceLevel,
  sectionId,
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
    isExpanded => (
      <button
        type="button"
        className={styles.expandedHeaderLevelCellExpandable}
        aria-expanded={isExpanded}
      >
        {<FontAwesome icon={isExpanded ? 'caret-down' : 'caret-right'} />}
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
          onClick={() => toggleExpandedChoiceLevel(sectionId, level)}
        >
          {level.sublevels?.length > 0
            ? expandedLevel(true)
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
      sectionId,
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
        onClick={() => toggleExpandedChoiceLevel(sectionId, level)}
        id={getLevelColumnHeaderId(level.id)}
      >
        {level.sublevels?.length > 0
          ? expandedLevel(false)
          : getLevelHeaderContent()}
      </th>
    ),
    [
      lesson,
      level,
      sectionId,
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

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
  }),
  dispatch => ({
    toggleExpandedChoiceLevel(sectionId, levelId) {
      dispatch(toggleExpandedChoiceLevel(sectionId, levelId));
    },
  })
)(LevelProgressHeader);

LevelProgressHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  level: PropTypes.object.isRequired,
  isLevelExpanded: PropTypes.bool,
  toggleExpandedChoiceLevel: PropTypes.func.isRequired,
  sectionId: PropTypes.number.isRequired,
};
