import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';
import {lessonHasLevels} from '../progress/progressHelpers';
import {addExpandedLesson} from '../sectionProgress/sectionProgressRedux';

import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';

import styles from './progress-table-v2.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

const getUninteractiveLessonColumnHeader = (lesson, allLocked) => {
  return (
    <div
      className={styles.lessonHeaderCell}
      key={lesson.id}
      data-tip
      data-for={getTooltipId(lesson)}
    >
      <LessonTitleTooltip lesson={lesson} />
      {!lesson.lockable && lesson.relative_position}
      {lesson.lockable && (
        <FontAwesome
          icon={allLocked ? 'lock' : 'lock-open'}
          title={i18n.locked()}
        />
      )}
    </div>
  );
};

const getSkeletonLessonHeader = lessonId => (
  <div
    aria-label={i18n.loadingLesson()}
    className={classNames(
      styles.lessonHeaderCell,
      styles.lessonHeaderCellContainer
    )}
    key={lessonId}
  >
    <div
      data-testid={'skeletonize-content'}
      className={classNames(
        styles.lessonSkeletonHeaderCell,
        skeletonizeContent.skeletonizeContent
      )}
    />
  </div>
);

function LessonProgressColumnHeader({
  scriptId,
  sectionId,
  addExpandedLesson,
  lesson,
  allLocked,
}) {
  if (lesson.isFake) {
    return getSkeletonLessonHeader(lesson.id);
  }
  if (!lessonHasLevels(lesson) || lesson.lockable) {
    return getUninteractiveLessonColumnHeader(lesson, allLocked);
  }
  return (
    <button
      id={'ui-test-lesson-header-' + lesson.relative_position}
      className={styles.lessonHeaderCellInteractive}
      data-tip
      data-for={getTooltipId(lesson)}
      onClick={() => addExpandedLesson(scriptId, sectionId, lesson)}
      aria-label={lesson.title}
      aria-expanded={false}
      type="button"
      tabIndex={0}
    >
      <LessonTitleTooltip lesson={lesson} />
      <FontAwesome
        icon="caret-right"
        className={styles.lessonHeaderCaret}
        title={i18n.expand()}
      />
      {lesson.relative_position}
    </button>
  );
}

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    scriptId: state.unitSelection.scriptId,
  }),
  dispatch => ({
    addExpandedLesson(scriptId, sectionId, lessonId) {
      dispatch(addExpandedLesson(scriptId, sectionId, lessonId));
    },
  })
)(LessonProgressColumnHeader);

export const UnconnectedLessonProgressColumnHeader = LessonProgressColumnHeader;

LessonProgressColumnHeader.propTypes = {
  sectionId: PropTypes.number,
  scriptId: PropTypes.number,
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
  allLocked: PropTypes.bool,
};
