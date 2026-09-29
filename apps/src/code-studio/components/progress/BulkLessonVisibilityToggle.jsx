import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Tooltip} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {toggleHiddenLesson} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {getStore} from '@cdo/apps/redux';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import i18n from '@cdo/locale';

import style from './bulk-lesson-visibility-toggle.module.scss';

function toggleHiddenLessons(unitName, sectionId, lessons, hidden) {
  lessons.forEach(lesson => {
    // For some reason, sectionId is a number here, and needs to be a string
    // for the redux toggle stuff to work.
    getStore().dispatch(
      toggleHiddenLesson(unitName, sectionId.toString(), lesson.id, hidden)
    );
  });
}

function BulkLessonVisibilityToggle({lessons, sectionId, unitName}) {
  return (
    <div className={style.container}>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<FontAwesomeV6Icon iconName="eye" iconStyle="regular" />}
        onClick={() => toggleHiddenLessons(unitName, sectionId, lessons, false)}
      >
        {i18n.showAllLessons()}
      </MuiButton>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<FontAwesomeV6Icon iconName="eye-slash" />}
        onClick={() => toggleHiddenLessons(unitName, sectionId, lessons, true)}
      >
        {i18n.hideAllLessons()}
      </MuiButton>
      <Tooltip placement="top" title={i18n.bulkLessonVisibilityToggleTip()}>
        <button
          type="button"
          aria-label={i18n.bulkLessonVisibilityToggleTip()}
          className={style.infoTipButton}
        >
          <FontAwesomeV6Icon
            iconName="circle-info"
            className={style.infoTipIcon}
          />
        </button>
      </Tooltip>
    </div>
  );
}

BulkLessonVisibilityToggle.propTypes = {
  lessons: PropTypes.arrayOf(unitCalendarLesson),

  // redux provided
  sectionId: PropTypes.number.isRequired,
  unitName: PropTypes.string.isRequired,
};

export const UnconnectedBulkLessonVisibilityToggle = BulkLessonVisibilityToggle;
export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
  unitName: state.progress.scriptName,
}))(BulkLessonVisibilityToggle);
