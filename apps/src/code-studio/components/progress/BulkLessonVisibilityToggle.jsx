import React from 'react';
import {connect} from 'react-redux';
import {getStore} from '../../../redux';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import FontAwesome from '../../../templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import {toggleHiddenLesson} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {unitCalendarLesson} from '../../../templates/progress/unitCalendarLessonShapes';
import _ from 'lodash';
import style from './bulk-lesson-visibility-toggle.module.scss';

function BulkLessonVisibilityToggle({lessons, sectionId, scriptName}) {
  const tooltipId = _.uniqueId();

  return (
    <div className={style.container}>
      <Button
        text="Show All Lessons"
        icon="eye"
        color={Button.ButtonColor.gray}
        onClick={() =>
          toggleHiddenLessons(scriptName, sectionId, lessons, false)
        }
      />
      <Button
        text="Hide All Lessons"
        icon="eye-slash"
        color={Button.ButtonColor.gray}
        onClick={() =>
          toggleHiddenLessons(scriptName, sectionId, lessons, true)
        }
      />
      <span data-tip data-for={tooltipId}>
        <FontAwesome icon="info-circle" className={style.infoTipIcon} />
      </span>
      <ReactTooltip id={tooltipId} effect="solid">
        <p>
          Make all lessons in this Unit visible or hidden for your students.
        </p>
      </ReactTooltip>
    </div>
  );
}

BulkLessonVisibilityToggle.propTypes = {
  lessons: PropTypes.arrayOf(unitCalendarLesson),

  // redux provided
  sectionId: PropTypes.number,
  scriptName: PropTypes.string.isRequired
};

function toggleHiddenLessons(scriptName, sectionId, lessons, hidden) {
  lessons.forEach(lesson => {
    // For some reason, sectionId is a number here, and needs to be a string
    // for the redux toggle stuff to work.
    getStore().dispatch(
      toggleHiddenLesson(scriptName, sectionId.toString(), lesson.id, hidden)
    );
  });
}

export const UnconnectedBulkLessonVisibilityToggle = BulkLessonVisibilityToggle;
export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    scriptName: state.progress.scriptName
  }) /*,
  dispatch => ({
    toggleHiddenLesson(unitName, sectionId, lessonId, hidden) {
      dispatch(toggleHiddenLesson(unitName, sectionId, lessonId, hidden));
    }
  }) */
)(BulkLessonVisibilityToggle);
